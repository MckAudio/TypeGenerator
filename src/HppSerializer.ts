import { ISerializer, SerializerData } from "./ISerializer";
import { ArrayType, ClassType, LinkType, SimpleType } from "./types";
import { GetDate } from "./tools";
import { GetCppType } from "./SerializerTools";
import path from "path";

export class HppSerializer extends ISerializer {
    protected deps = new Set<string>();

    constructor(fileName: string, author: string, namespace?: string) {
        super(fileName, author, "hpp", namespace);
    }

    protected begin() {
        this.store.header = `/**\n * @file ${this.fileName}.${this.extension}\n`;
        this.store.header += ` * @author ${this.author}\n * @brief Autogenerated by MckAudio TypeGenerator\n`;
        this.store.header += ` * @link https://github.com/MckAudio/TypeGenerator\n`;
        this.store.header += ` * @date ${GetDate()}\n */\n\n`;
        this.store.header += `#pragma once\n\n`;

        if (this.namespaceName !== undefined) {
            this.indent = "\t";
            this.store.content = `namespace ${this.namespaceName} {\n`;
            this.store.footer = `} // namespace ${this.namespaceName}\n`;
        }
    }

    end() {
        this.deps.forEach(dep => {
            this.store.header += `#include ${dep}\n`;
        });
        this.store.header += `\n`;
    }

    addClassMember(name: string, member: ClassType) {
        let tmp = new SerializerData();
        tmp.header = `${this.indent}class ${name} `;
        if (member.parent !== undefined) {
            tmp.header += `: public ${member.parent} `;
        }
        tmp.header += `{\n${this.indent}public:\n`;

        tmp.footer = `${this.indent}}; // class ${name}\n\n`;

        this.classes[name] = tmp;
    }

    addSimpleMember(className: string, name: string, member: SimpleType) {
        let tmp = this.classes[className];
        tmp.content += `${this.indent}\t${GetCppType(member)} ${name}{`;
        if (member.default !== undefined) {
            if (member.type === "string") {
                tmp.content += `\"${member.default}\"`;
            } else {
                tmp.content += `${member.default}`;
            }
        }
        tmp.content += `};\n`;
        if (member.type === "string") {
            this.deps.add(`<string>`);
        }
    }

    addLinkMember(className: string, name: string, member: LinkType) {
        let tmp = this.classes[className];
        tmp.content += `${this.indent}\t${GetCppType(member)} ${name}{};\n`;
        if (member.file !== undefined) {
            this.deps.add(`"${path.basename(member.file, path.extname(member.file))}.${this.extension}"`);
        }
    }

    addArrayMember(className: string, name: string, member: ArrayType) {
        let tmp = this.classes[className];
        tmp.content += `${this.indent}\tstd::vector<${GetCppType(member.items)}> ${name}{};\n`;
        this.deps.add(`<vector>`);
    }

}