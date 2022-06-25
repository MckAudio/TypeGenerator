import { BaseType, LinkType } from "./types";

export function GetCppType(jsonType: BaseType): string {
    switch (jsonType.type) {
        case "signed":
            return "int";
        case "unsigned":
            return "unsigned";
        case "float":
            return "double";
        case "string":
            return "std::string";
        case "boolean":
        case "bool":
            return "bool";
        case "link":
            return (jsonType as LinkType).name;
        default:
            return "";
    }
}

export function GetTsType(jsonType: BaseType): string {
    switch (jsonType.type) {
        case "signed":
        case "unsigned":
        case "float":
            return "number";
        case "string":
            return "string";
        case "boolean":
        case "bool":
            return "boolean";
        case "link":
            return (jsonType as LinkType).name;
        default:
            return "";
    }
}

export function GetTsDefault(jsonType: BaseType): string {
    switch (jsonType.type) {
        case "signed":
        case "unsigned":
        case "float":
            return "0";
        case "string":
            return "\"\"";
        case "boolean":
        case "bool":
            return "false";
        case "link":
            return `new ${(jsonType as LinkType).name}()`;
        default:
            return "";
    }
}