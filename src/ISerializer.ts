import { ArrayType, ClassType, Dictionary, LinkType, SimpleType } from "./types";
import path from "path";
import fs from "fs";

export class SerializerData {
    header: string = "";
    content: string = "";
    footer: string = "";
    sortId: number = 0;

    getOutput(): string {
        return `${this.header}\n${this.content}\n${this.footer}`;
    }
};

abstract class ISerializerFn {
    abstract addClassMember(name: string, member: ClassType): void;

    abstract addSimpleMember(className: string, name: string, member: SimpleType): void;

    abstract addLinkMember(className: string, name: string, member: LinkType): void;

    abstract addArrayMember(className: string, name: string, member: ArrayType): void;

    abstract writeToFile(outDir: string): void;
}

export abstract class ISerializer extends ISerializerFn {
    protected store = new SerializerData();
    protected abstract extension: string;

    author: string;
    namespaceName: string;
    sortId: number = 0;
    private source: string = "";
    private finished: boolean = false;
    protected classes: Dictionary<SerializerData> = {};

    constructor(name: string, author: string) {
        super();
        this.namespaceName = name;
        this.author = author;
        this.begin();
    }

    protected abstract begin(): void;

    protected abstract end(): void;



    getOutput(): string {
        if (this.finished === false) {
            this.end();
            Object.entries(this.classes).sort((a,b) => a[1].sortId - b[1].sortId).forEach(cl => {
                this.store.content += cl[1].getOutput();
            });
            this.source = this.store.getOutput();
            this.finished = true;
        }
        return this.source;
    }

    writeToFile(outDir: string) {
        let sourceRoot = path.join(outDir, this.extension);
        if (fs.existsSync(sourceRoot) === false) {
            fs.mkdirSync(sourceRoot, { recursive: true });
        }
        let outFileName = path.join(sourceRoot, `${this.namespaceName}.${this.extension}`)
        fs.writeFileSync(outFileName, this.getOutput(), { encoding: 'utf-8' });
    }
}

export class SerializerMap extends ISerializerFn {
    private serializers: Array<ISerializer> = [];

    addSerializer(serializer: ISerializer): void {
        this.serializers.push(serializer);
    }


    addClassMember(name: string, member: ClassType) {
        this.serializers.forEach(s => {
            s.addClassMember(name, member);
        });
    }

    addSimpleMember(className: string, name: string, member: SimpleType) {
        this.serializers.forEach(s => {
            s.addSimpleMember(className, name, member);
        });
    }

    addLinkMember(className: string, name: string, member: LinkType) {
        this.serializers.forEach(s => {
            s.addLinkMember(className, name, member);
        });
    }

    addArrayMember(className: string, name: string, member: ArrayType) {
        this.serializers.forEach(s => {
            s.addArrayMember(className, name, member);
        });
    }

    writeToFile(outDir: string) {
        this.serializers.forEach(s => {
            s.writeToFile(outDir);
        });
    }
}