export class ClassType {
    name: string = "";
    type: "class" | "struct" = "struct";
    parent?: string;
    members: Array<ClassType | SimpleType> = [];
}

export class SimpleType {
    name: string = "";
    type: "signed" | "unsigned" | "float" | "string" | "bool" = "bool";
    isArray: boolean = false;
    minimum?: number;
    maximum?: number;
    default?: number | string | boolean;
}