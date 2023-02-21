export interface Dictionary<Type> {
    [name: string]: Type
}

export class FileMeta {
    author: string = "";
    namespace?: string;
}

export class FileType {
    meta = new FileMeta();
    classes: Dictionary<ClassType> = {};
}

export class BaseType {
    type: string = "base";
    newProperty?: boolean;
}

export class ClassType extends BaseType {
    type: "class" | "struct" = "class";
    parent?: string;
    members: Dictionary<SimpleType | LinkType | ArrayType> = {};
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
    namespace?: string;
    visibility?: "public" | "protected" | "private";
    file?: string;
}


export class FileStore {
    deps: Array<string> = [];
    path: string = "";
    parsed: boolean = false;
    data: Dictionary<ClassType> = {};
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