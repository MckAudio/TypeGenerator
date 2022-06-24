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