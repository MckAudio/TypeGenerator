import { BaseType, LinkType } from "./types";

export function GetCppNamespace(link: LinkType): string
{
    return link.namespace !== undefined && link.namespace.length > 0 ? link.namespace.join("::") + "::" : "";
}

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

export function GetTsNamespace(link: LinkType): string 
{
    return link.namespace !== undefined && link.namespace.length > 0 ? link.namespace.join(".") + "." : "";
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

export function GetRapidType(jsonType: BaseType): [string, string] {
    switch (jsonType.type) {
        case "signed":
            return ["Int", ""];
        case "unsigned":
            return ["Uint", ""];
        case "float":
            return ["Double", ""];
        case "string":
            return ["String", ".c_str()"];
        case "boolean":
        case "bool":
            return ["Bool", ""];
        case "link":
            return [(jsonType as LinkType).name, ""];
        default:
            return ["", ""];
    }
}

export function GetTsDefault(jsonType: BaseType, namespace?: string): string {
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
            return namespace !== undefined ? `new ${namespace}.${(jsonType as LinkType).name}()` : `new ${(jsonType as LinkType).name}()`;
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