import { BaseType, EnumType, LinkType } from "./types";

export function GetCppNamespace(link: LinkType): string {
    return link.namespace !== undefined && link.namespace.length > 0 ? link.namespace.join("::") + "::" : "";
}

export function GetCppType(jsonType: BaseType): string {
    switch (jsonType.type) {
        case "char":
        case "i8":
            return "int8_t";
        case "byte":
        case "u8":
            return "uint8_t";
        case "signed":
        case "i32":
            return "int32_t";
        case "unsigned":
        case "u32":
            return "uint32_t";
        case "i64":
            return "int64_t";
        case "u64":
            return "uint64_t";
        case "float":
        case "float32":
        case "f32":
            return "float";
        case "double":
        case "float64":
        case "f64":
            return "double";
        case "string":
            return "std::string";
        case "boolean":
        case "bool":
            return "bool";
        case "link":
            return (jsonType as LinkType).name;
        case "enum":
            return (jsonType as EnumType).name;
        default:
            return "";
    }
}

export function GetTsNamespace(link: LinkType): string {
    return link.namespace !== undefined && link.namespace.length > 0 ? link.namespace.join(".") + "." : "";
}

export function GetTsType(jsonType: BaseType): string {
    switch (jsonType.type) {
        case "char":
        case "byte":
        case "i8":
        case "u8":
        case "signed":
        case "unsigned":
        case "i32":
        case "u32":
        case "i64":
        case "u64":
        case "float":
        case "double":
        case "float32":
        case "float64":
        case "f32":
        case "f64":
            return "number";
        case "string":
            return "string";
        case "boolean":
        case "bool":
            return "boolean";
        case "link":
            return (jsonType as LinkType).name;
        case "enum":
            return (jsonType as EnumType).name;
        default:
            return "";
    }
}

export function GetRapidType(jsonType: BaseType): [string, string] {
    switch (jsonType.type) {
        case "char":
        case "i8":
        case "signed":
        case "i32":
        case "i64":
            return ["Int", ""];
        case "byte":
        case "u8":
        case "unsigned":
        case "u32":
        case "u64":
            return ["Uint", ""];
        case "float":
        case "double":
        case "float32":
        case "float64":
        case "f32":
        case "f64":
            return ["Double", ""];
        case "string":
            return ["String", ".c_str()"];
        case "boolean":
        case "bool":
            return ["Bool", ""];
        case "link":
            return [(jsonType as LinkType).name, ""];
        case "enum":
            return [(jsonType as EnumType).name, ""];
        default:
            return ["", ""];
    }
}

export function GetTsDefault(jsonType: BaseType, namespace?: string): string {
    switch (jsonType.type) {
        case "char":
        case "byte":
        case "i8":
        case "u8":
        case "signed":
        case "unsigned":
        case "i32":
        case "u32":
        case "i64":
        case "u64":
        case "float":
        case "double":
        case "float32":
        case "float64":
        case "f32":
        case "f64":
            return "0";
        case "string":
            return "\"\"";
        case "boolean":
        case "bool":
            return "false";
        case "link":
            return namespace !== undefined ? `new ${namespace}.${(jsonType as LinkType).name}()` : `new ${(jsonType as LinkType).name}()`;
        case "enum":
            return (jsonType as EnumType).default !== undefined ? `${GetTsType(jsonType)}.${(jsonType as EnumType).default}` : "0";
        default:
            return "";
    }
}

export enum JsonLibrary {
    None = 0,
    RapidJson,
    JsonCPP,
    Nlohmann
}