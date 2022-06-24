import { ArrayType, ClassType, LinkType, SimpleType } from "./types";

export abstract class ISerializer {
    author: string;
    namespaceName: string;
    source: string = "";
    protected finished: boolean = false;

    constructor(name: string, author: string) {
        this.namespaceName = name;
        this.author = author;
        this.begin();
    }

    protected abstract begin(): void;

    protected abstract end(): void;

    abstract addClassMember(member: ClassType): void;

    abstract addSimpleMember(member: SimpleType): void;

    abstract addLinkMember(member: LinkType): void;

    abstract addArrayMember(member: ArrayType): void;


    getOutput(): string {
        if (this.finished === false) {
            this.end();
            this.finished = true;
        }
        return this.source;
    }
}