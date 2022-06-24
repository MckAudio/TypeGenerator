export interface Dictionary<Type> {
    [name: string]: Type
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

export class FileMeta {
    author: string = "";
}

export class FileType {
    meta = new FileMeta();
    classes: Dictionary<ClassType> = {};
}

export class BaseType {
    type: string = "base";
}

export class ClassType extends BaseType {
    type: "class" | "struct" = "class";
    parent?: string;
    members: Dictionary<SimpleType | LinkType | ArrayType> = {};
}

export class SimpleType extends BaseType {
    type: "signed" | "unsigned" | "float" | "string" | "bool" | "boolean" = "bool";
    visibility: "public" | "protected" | "private" = "public";
    minimum?: number;
    maximum?: number;
    default?: number | string | boolean;
}

export class ArrayType extends BaseType {
    type: "array" = "array";
    visibility: "public" | "protected" | "private" = "public";
    items: SimpleType | LinkType = new SimpleType();
}

export class LinkType extends BaseType {
    type: "link" = "link";
    name: string = "";
    visibility: "public" | "protected" | "private" = "public";
    file?: string;
}