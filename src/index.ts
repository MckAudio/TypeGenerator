import path from 'path';
import { Dictionary, ClassType, SimpleType, ArrayType, LinkType, FileStore, FileType, IsSimpleType, EnumType, EnumDefinition, DictType } from "./types";
import { ISerializer, SerializerMap } from './ISerializer';

import fs, { link, mkdirSync, writeFileSync } from 'fs';
import { CppSerializer } from './CppSerializer';
import { HppSerializer } from './HppSerializer';
import { TsSerializer } from './TsSerializer';

import YAML from 'yaml';
import { JsonLibrary } from './SerializerTools';

declare global {
    interface String {
        isOneOf(keys: Array<string>): boolean;
    }
}

String.prototype.isOneOf = function (this: string, keys: Array<string>): boolean {
    return keys.findIndex((val) => val == this) >= 0;
}

let fileMap: Dictionary<FileStore> = {};
let sources: Dictionary<SerializerMap> = {};

function Copy<T>(data: T): T {
    return JSON.parse(JSON.stringify(data)) as T;
}

function ReadEnum(fileName: string, name: string, data: EnumDefinition): any {
    let fileId = path.basename(fileName, path.extname(fileName));

    if (sources[fileId].hasEnumDefinition(name)) {
        return;
    }

    sources[fileId].addEnumDefinition(name, data);
}

function ReadClass(fileName: string, name: string, data?: ClassType): any {
    let fileId = path.basename(fileName, path.extname(fileName));

    if (data === undefined) {
        if (fileMap.hasOwnProperty(fileId) === false) {
            ReadFile(fileName);
        }
    }
    let clData = data !== undefined ? data : fileMap[fileId].data[name];

    if (sources[fileId].hasClassMember(name)) {
        return;
    }

    sources[fileId].addClassMember(name, clData);

    Object.entries(clData.members).forEach(entry => {
        if (IsSimpleType(entry[1])) {
            sources[fileId].addSimpleMember(name, entry[0], entry[1] as SimpleType);
        } else if (entry[1].type === "array") {
            let arr = entry[1] as ArrayType;
            if (IsSimpleType(arr.items)) {
                let arrVal = arr.items as SimpleType;
            } else if (arr.items.type == "link") {
                let link = arr.items as LinkType;
                let linkFileName = fileMap[fileId].path;
                if (link.file !== undefined) {
                    linkFileName = path.join(path.dirname(fileMap[fileId].path), link.file);
                }
                ReadClass(linkFileName, link.name);
                if (link.file !== undefined) {
                    let ns = fileMap[path.basename(linkFileName, path.extname(linkFileName))].namespace;
                    ((entry[1] as ArrayType).items as LinkType).namespace = ns;
                }
            } else if (arr.items.type == "array") {
                let arrVal = arr.items as ArrayType;
            }
            sources[fileId].addArrayMember(name, entry[0], entry[1] as ArrayType);
        } else if (entry[1].type === "link") {
            let link = entry[1] as LinkType;
            let linkFileName = fileMap[fileId].path;
            if (link.file !== undefined) {
                linkFileName = path.join(path.dirname(fileMap[fileId].path), link.file);
            }
            ReadClass(linkFileName, link.name);
            if (link.file !== undefined) {
                (entry[1] as LinkType).namespace = fileMap[path.basename(linkFileName, path.extname(linkFileName))].namespace
            }
            sources[fileId].addLinkMember(name, entry[0], entry[1] as LinkType);
        } else if (entry[1].type === "enum") {
            sources[fileId].addEnumMember(name, entry[0], entry[1] as EnumType);
        } else if (entry[1].type === "dict") {
            let dict = entry[1] as DictType;
            if (IsSimpleType(dict.items)) {
                let dictVal = dict.items as SimpleType;
            } else if (dict.items.type == "link") {
                let link = dict.items as LinkType;
                let linkFileName = fileMap[fileId].path;
                if (link.file !== undefined) {
                    linkFileName = path.join(path.dirname(fileMap[fileId].path), link.file);
                }
                ReadClass(linkFileName, link.name);
                if (link.file !== undefined) {
                    let ns = fileMap[path.basename(linkFileName, path.extname(linkFileName))].namespace;
                    (dict.items as LinkType).namespace = ns;
                }
            }
            sources[fileId].addDictMember(name, entry[0], dict);
        }
    });
}

function ReadFile(file: string) {
    if (fs.existsSync(file) == false) {
        console.error(`File '${file}' does not exist.`);
        return;
    }

    let str = fs.readFileSync(file, { encoding: 'utf-8' });
    let obj;

    switch (path.extname(file)) {
        case ".json":
            obj = JSON.parse(str) as FileType;
            break;
        case ".yaml":
            obj = YAML.parse(str) as FileType;
            break;
        default:
            return;
    }


    let fileId = path.basename(file, path.extname(file));
    fileMap[fileId] = new FileStore();
    fileMap[fileId].path = file;
    fileMap[fileId].data = obj.classes
    fileMap[fileId].enums = obj.enums !== undefined ? obj.enums : {};
    fileMap[fileId].namespace = obj.meta.namespace;

    sources[fileId] = new SerializerMap();
    sources[fileId].addSerializer(new CppSerializer(fileId, obj.meta.author, obj.meta.namespace, JsonLibrary.Nlohmann));
    sources[fileId].addSerializer(new HppSerializer(fileId, obj.meta.author, obj.meta.namespace, JsonLibrary.Nlohmann));
    sources[fileId].addSerializer(new TsSerializer(fileId, obj.meta.author, obj.meta.namespace));

    Object.entries(fileMap[fileId].enums).forEach(entry => {
        ReadEnum(file, entry[0], entry[1]);
    })

    Object.entries(fileMap[fileId].data).forEach(entry => {
        ReadClass(file, entry[0], entry[1]);
    });

    fileMap[fileId].parsed = true;
}

function WriteJsonFile(file: string) {
    let key = path.basename(file, path.extname(file));
    let rootPath = path.join(path.dirname(file), "json");
    if (fs.existsSync(rootPath) === false) {
        fs.mkdirSync(rootPath);
    }

    if (fileMap.hasOwnProperty(key)) {
        let fp = path.join(rootPath, path.basename(file));
        let fd = fileMap[key];

        let fo = new FileType();
        fo.meta.author = "TypeGenerator";
        fo.meta.namespace = fd.namespace;
        fo.enums = fd.enums;

        Object.entries(fd.data).forEach(cIn => {
            let cOut = new ClassType();
            cOut.newProperty = cIn[1].newProperty;
            cOut.parent = cIn[1].parent;

            Object.entries(cIn[1].members).forEach(mIn => {
                if (mIn[1].type === "link" && mIn[1].hasOwnProperty("file")) {
                    // Do special stuff
                    let linkFileName = mIn[1].file as string;
                    let linkKey = path.basename(linkFileName, path.extname(linkFileName));
                    if (fileMap.hasOwnProperty(linkKey)) {
                        let newLinkName = `${linkKey}_${mIn[1].name}`;
                        let mOut = new LinkType();
                        mOut.newProperty = mIn[1].newProperty;
                        mOut.name = newLinkName;
                        cOut.members[mIn[0]] = mOut;

                        // Add all members of linked file with prefix to our file
                        if (fo.classes.hasOwnProperty(newLinkName) === false) {
                            let fl = fileMap[linkKey];
                            Object.entries(fl.enums).forEach(fle => (fo.enums as Dictionary<EnumDefinition>)[fle[0]] = fle[1]);
                            Object.entries(fl.data).forEach(flc => {
                                let cn = `${linkKey}_${flc[0]}`;
                                fo.classes[cn] = Copy(flc[1]);
                                Object.entries(fo.classes[cn].members).forEach(tm => {
                                    if (tm[1].type === "link") {
                                        tm[1].name = `${linkKey}_${tm[1].name}`;
                                    } else if ((tm[1].type === "array" || tm[1].type === "dict") && tm[1].items.type === "link") {
                                        tm[1].items.name = `${linkKey}_${tm[1].items.name}`;
                                    }
                                });
                            });
                        }
                    }
                } else {
                    cOut.members[mIn[0]] = Copy(mIn[1]);
                }
            });
            fo.classes[cIn[0]] = cOut;
        });


        let out = JSON.stringify(fo, undefined, 4);
        fs.writeFileSync(fp, out);
    }

}

function WriteFileSources(fileId: string, outDir?: string) {
    let fileData = fileMap[fileId];
    let root = path.dirname(fileData.path);
    if (outDir !== undefined) {
        root = path.join(root, outDir);
        if (fs.existsSync(root) === false) {
            fs.mkdirSync(root, { recursive: true });
        }
    }

    sources[fileId].writeToFile(root);
}

function main(argc: number, argv: Array<any>) {
    if (argc < 1) {
        console.error("Please provide one or more JSON files with type definitions.");
        return;
    }

    for (let i = 0; i < argc; i++) {
        let fp = argv[i];
        if (path.isAbsolute(fp) === false) {
            fp = path.join(process.cwd(), argv[i]);
        }
        ReadFile(fp);
        WriteJsonFile(fp);
    }

    Object.entries(fileMap).forEach(entry => {
        if (entry[1].parsed) {
            console.log(`Successfully parsed file "${entry[0]}" in path "${entry[1].path}"`);
            WriteFileSources(entry[0]);
        } else {
            console.log(`Failed to parse file "${entry[0]}" in path "${entry[1].path}"`);
        }
    });
}

main(process.argv.length - 2, process.argv.slice(2));