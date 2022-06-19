import path from 'path';
import { Dictionary, ClassType, SimpleType, ArrayType, LinkType } from "./types";
import fs from 'fs';

function ReadClass(name: string, data: ClassType): any {

}

function ReadFile(file: string) {
    console.log(`Parsing file '${file}'`);
    if (fs.existsSync(file) == false) {
        console.error(`File '${file}' does not exist.`);
        return;
    }

    let str = fs.readFileSync(file, { encoding: 'utf-8'});
    let obj = JSON.parse(str) as Dictionary<ClassType>;

    Object.entries(obj).forEach(entry => {
       ReadClass(entry[0], entry[1]);
    });
}

function main(argc: number, argv: Array<any>) {
    if (argc < 1) {
        console.error("Please provide one or more JSON files with type definitions.");
        return;
    }

    for(let i = 0; i < argc; i++)
    {
        if (path.isAbsolute(argv[i])) {
            ReadFile(argv[i]);
        } else {
            ReadFile(path.join(process.cwd(), argv[i]));
        }
    }
}

main(process.argv.length - 2, process.argv.slice(2));