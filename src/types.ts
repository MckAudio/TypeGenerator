export interface Dictionary<Type> {
    [name: string]: Type
}

export class ClassType {
    type: "class" | "struct" = "struct";
    parent?: string;
    members: Dictionary<SimpleType | LinkType | ArrayType> = {};
}

export class SimpleType {
    type: "signed" | "unsigned" | "float" | "string" | "bool" | "boolean" = "bool";
    visibility: "public" | "protected" | "private" = "public";
    minimum?: number;
    maximum?: number;
    default?: number | string | boolean;
}

export class ArrayType {
    visibility: "public" | "protected" | "private" = "public";
    items: SimpleType | LinkType = new SimpleType();
}

export class LinkType {
    name: string = "";
    visibility: "public" | "protected" | "private" = "public";
    file?: string;
}