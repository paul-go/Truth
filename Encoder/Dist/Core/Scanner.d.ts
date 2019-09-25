import { Document } from "../../Truth/Core/X";
export default class Scanner {
    Document: Document;
    static FromFile(path: string): Promise<Scanner>;
    constructor(Document: Document);
}
