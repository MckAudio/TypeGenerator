import path from 'path';
import { Dictionary, ClassType, SimpleType, ArrayType, LinkType, FileStore, FileType, IsSimpleType } from "./types";
import { ISerializer, SerializerMap } from './ISerializer';

import fs from 'fs';
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

let debug = true;

const simpleTypes = ["signed", "unsigned", "float", "string", "bool", "boolean"];

function Copy<T>(data: T): T {
    return JSON.parse(JSON.stringify(data)) as T;
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
        if (entry[1].type.isOneOf(simpleTypes)) {
            sources[fileId].addSimpleMember(name, entry[0], entry[1] as SimpleType);
        } else if (entry[1].type == "array") {
            let arr = entry[1] as ArrayType;
            sources[fileId].addArrayMember(name, entry[0], entry[1] as ArrayType);


            if (IsSimpleType(arr.items)) {
                let arrVal = arr.items as SimpleType;
            } else if (arr.items.type == "link") {
                let link = arr.items as LinkType;
                let linkFileName = fileMap[fileId].path;
                if (link.file !== undefined) {
                    linkFileName = path.join(path.dirname(fileMap[fileId].path), link.file);
                }
                ReadClass(linkFileName, link.name);
            }
        } else if (entry[1].type == "link") {
            sources[fileId].addLinkMember(name, entry[0], entry[1] as LinkType);
            let link = entry[1] as LinkType;
            let linkFileName = fileMap[fileId].path;
            if (link.file !== undefined) {
                linkFileName = path.join(path.dirname(fileMap[fileId].path), link.file);
            }
            ReadClass(linkFileName, link.name);
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
    console.log(`Parsing file '${file}'`);


    let fileId = path.basename(file, path.extname(file));
    fileMap[fileId] = new FileStore();
    fileMap[fileId].path = file;
    fileMap[fileId].data = obj.classes

    sources[fileId] = new SerializerMap();
    sources[fileId].addSerializer(new CppSerializer(fileId, obj.meta.author, obj.meta.namespace, JsonLibrary.Nlohmann));
    sources[fileId].addSerializer(new HppSerializer(fileId, obj.meta.author, obj.meta.namespace, JsonLibrary.Nlohmann));
    sources[fileId].addSerializer(new TsSerializer(fileId, obj.meta.author, obj.meta.namespace));

    Object.entries(fileMap[fileId].data).forEach(entry => {
        ReadClass(file, entry[0], entry[1]);
    });

    fileMap[fileId].parsed = true;
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
        if (path.isAbsolute(argv[i])) {
            ReadFile(argv[i]);
        } else {
            ReadFile(path.join(process.cwd(), argv[i]));
        }
    }

    if (debug) {
        Object.entries(fileMap).forEach(entry => {
            if (entry[1].parsed) {
                console.log(`Successfully parsed file "${entry[0]}" in path "${entry[1].path}"`);
                WriteFileSources(entry[0]);
            } else {
                console.log(`Failed to parse file "${entry[0]}" in path "${entry[1].path}"`);
            }
        });
    }
}

main(process.argv.length - 2, process.argv.slice(2));