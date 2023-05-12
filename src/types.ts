export interface Dictionary<Type> {
    [name: string]: Type
}

export class FileMeta {
    author: string = "";
    namespace?: Array<string>;
}

export class FileType {
    meta = new FileMeta();
    enums?: Dictionary<EnumDefinition>;
    classes: Dictionary<ClassType> = {};
}

export class BaseType {
    type: string = "base";
    newProperty?: boolean;
}

export class EnumDefinition {
    items: Dictionary<number> = {};
}

export class ClassType extends BaseType {
    type: "class" | "struct" = "class";
    parent?: string;
    members: Dictionary<SimpleType | LinkType | ArrayType | EnumType> = {};
}

export class SimpleType extends BaseType {
    type: "signed" | "unsigned" | "float" | "string" | "bool" | "boolean" = "bool";
    visibility?: "public" | "protected" | "private";
    minimum?: number;
    maximum?: number;
    default?: number | string | boolean;
}

export class ArrayType extends BaseType {
    type: "array" = "array";
    visibility?: "public" | "protected" | "private";
    items: SimpleType | LinkType = new SimpleType();
}

export class LinkType extends BaseType {
    type: "link" = "link";
    name: string = "";
    namespace?: Array<string>;
    visibility?: "public" | "protected" | "private";
    file?: string;
}

export class EnumType extends BaseType {
    type: "enum" = "enum";
    name: string = "";
    default?: number;
    visibility?: "public" | "protected" | "private";
}

export class FileStore {
    namespace?: Array<string>;
    deps: Array<string> = [];
    path: string = "";
    parsed: boolean = false;
    data: Dictionary<ClassType> = {};
    enums: Dictionary<EnumDefinition> = {};
    sources: Dictionary<string> = {
        cpp: "",
        hpp: "",
        svelte: ""
    }
}

export function IsSimpleType(type: BaseType)
{
    return ["signed", "unsigned", "float", "string", "bool", "boolean"].findIndex(s => s === type.type) >= 0;
}