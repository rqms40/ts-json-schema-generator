import stringify from "safe-stable-stringify";
import type ts from "typescript";
import type { BaseType } from "./Type/BaseType.js";
import type { ReferenceType } from "./Type/ReferenceType.js";
import { getKey } from "./Utils/nodeKey.js";

export class Context {
    private cacheKey: string | null = null;
    private arguments: BaseType[] = [];
    private parameters: string[] = [];
    private reference?: ts.Node;
    private defaultArgument = new Map<string, BaseType>();

    public constructor(reference?: ts.Node) {
        this.reference = reference;
    }

    public pushArgument(argumentType: BaseType): void {
        this.arguments.push(argumentType);
        this.cacheKey = null;
    }

    public pushParameter(parameterName: string): void {
        this.parameters.push(parameterName);
    }

    public setDefault(parameterName: string, argumentType: BaseType): void {
        this.defaultArgument.set(parameterName, argumentType);
    }

    public getCacheKey(): string {
        if (this.cacheKey == null) {
            this.cacheKey = stringify([
                this.reference ? getKey(this.reference, this) : "",
                this.arguments.map((argument) => argument?.getId()),
            ]);
        }
        return this.cacheKey;
    }

    public getArgument(parameterName: string): BaseType {
        const index: number = this.parameters.indexOf(parameterName);

        if ((index < 0 || !this.arguments[index]) && this.defaultArgument.has(parameterName)) {
            return this.defaultArgument.get(parameterName)!;
        }

        return this.arguments[index];
    }

    public getParameters(): readonly string[] {
        return this.parameters;
    }
    public getArguments(): readonly BaseType[] {
        return this.arguments;
    }

    public getReference(): ts.Node | undefined {
        return this.reference;
    }

    /**
     * Snapshot of the arguments and parameters visible to the current parse.
     * Callers that defer work (function return types) must not keep using the
     * live context, which later parses mutate.
     */
    public clone(): Context {
        const cloned = new Context(this.reference);
        cloned.arguments = this.arguments.slice();
        cloned.parameters = this.parameters.slice();
        cloned.defaultArgument = new Map(this.defaultArgument);
        return cloned;
    }
}

export interface NodeParser {
    createType(node: ts.Node, context: Context, reference?: ReferenceType): BaseType;
}
