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
    members: Dictionary<SimpleType | LinkType | ArrayType | EnumType | DictType> = {};
}

export type T_FloatSignature = "float" | "double" | "float32" | "float64" | "f32" | "f64";
export type T_IntSignature = "signed" | "unsigned" | "char" | "byte" | "i32" | "u32" | "i64" | "u64" | "i8" | "u8";
export type T_BoolSignature = "bool" | "boolean";
export type T_StringSignature = "string";
export type T_SimpleSignature = T_FloatSignature | T_IntSignature | T_BoolSignature | T_StringSignature;

export const simpleTypeNames = ["float", "double", "float32", "float64", "f32", "f64", "signed", "unsigned", "char", "byte", "i32", "u32", "i64", "u64", "i8", "u8", "bool", "boolean", "string"];

export class SimpleType extends BaseType {
    type: T_SimpleSignature = "bool";
    visibility?: "public" | "protected" | "private";
    minimum?: number;
    maximum?: number;
    default?: number | string | boolean;
}

export class ArrayType extends BaseType {
    type: "array" = "array";
    visibility?: "public" | "protected" | "private";
    items: SimpleType | LinkType | ArrayType = new SimpleType();
}

export class DictType extends BaseType {
    type: "dict" = "dict";
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

export function IsSimpleType(type: BaseType) {
    return simpleTypeNames.findIndex(s => s === type.type) >= 0;
}