import { ArrayType, ClassType, Dictionary, LinkType, SimpleType } from "./types";
import path from "path";
import fs from "fs";

export class SerializerData {
    header: string = "";
    content: string = "";
    footer: string = "";
    sortId: number = 0;

    getOutput(): string {
        return `${this.header}${this.content}${this.footer}`;
    }
};

export class SerializerDataArray {
    private data: Array<SerializerData> = [];
    private len: number = 0;
    sortId: number = 0;

    getOutput(): string {
        let tmp = "";
        for (let i = 0; i < this.len; i++)
        {
            tmp += `${this.data[i].header}${this.data[i].content}${this.data[i].footer}`;
        }
        return tmp;
    }

    createMember(): number {
        this.data.push(new SerializerData());
        this.len += 1;
        return this.len - 1;
    }
    addMember(member: SerializerData): number {
        this.data.push(member);
        this.len += 1;
        return this.len - 1;
    }

    addToHeader(idx: number, content: string): void {
        this.data[idx].header += content;
    }
    addToContent(idx: number, content: string): void {
        this.data[idx].content += content;
    }
    addToFooter(idx: number, content: string): void {
        this.data[idx].footer += content;
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
    protected extension: string = "none";

    author: string;
    namespaceName?: string;
    fileName: string;
    sortId: number = 0;
    private source: string = "";
    private finished: boolean = false;
    protected classes: Dictionary<SerializerDataArray> = {};

    protected indent: string = "";

    protected constructor(fileName: string, author: string, extension: string, namespace?: string) {
        super();
        this.fileName = fileName;
        this.author = author;
        this.extension = extension;
        this.namespaceName = namespace;
        this.begin();
    }

    protected abstract begin(): void;

    protected abstract end(): void;



    getOutput(): string {
        if (this.finished === false) {
            this.end();
            this.store.content = "";
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
        let outFileName = path.join(sourceRoot, `${this.fileName}.${this.extension}`)
        fs.writeFileSync(outFileName, this.getOutput(), { encoding: 'utf-8' });
    }
}

export class SerializerMap extends ISerializerFn {
    private serializers: Array<ISerializer> = [];
    private classes: Dictionary<Set<string>> = {};// = new Set<string>();

    addSerializer(serializer: ISerializer): void {
        this.serializers.push(serializer);
    }

    hasClassMember(name: string): boolean {
        return this.classes.hasOwnProperty(name);
    }

    addClassMember(name: string, member: ClassType): boolean {
        if (this.classes.hasOwnProperty(name)) {
            return false;
        }
        this.classes[name] = new Set<string>();
        this.serializers.forEach(s => {
            s.addClassMember(name, member);
        });
        return true;
    }

    addSimpleMember(className: string, name: string, member: SimpleType) {
        if (this.classes[className].has(name)) {
            return;
        }
        this.serializers.forEach(s => {
            s.addSimpleMember(className, name, member);
        });
        this.classes[className].add(name);
    }

    addLinkMember(className: string, name: string, member: LinkType) {
        if (this.classes[className].has(name)) {
            return;
        }
        this.serializers.forEach(s => {
            s.addLinkMember(className, name, member);
        });
        this.classes[className].add(name);
    }

    addArrayMember(className: string, name: string, member: ArrayType) {
        if (this.classes[className].has(name)) {
            return;
        }
        this.serializers.forEach(s => {
            s.addArrayMember(className, name, member);
        });
        this.classes[className].add(name);
    }

    writeToFile(outDir: string) {
        this.serializers.forEach(s => {
            s.writeToFile(outDir);
        });
    }
}