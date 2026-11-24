import type ts from "typescript";
import { BaseType } from "./BaseType.js";
import type { ObjectType } from "./ObjectType.js";

export class FunctionType extends BaseType {
    private comment: string | undefined;

    constructor(
        node?: ts.FunctionTypeNode | ts.FunctionExpression | ts.FunctionDeclaration | ts.ArrowFunction,
        protected namedArguments?: ObjectType,
        protected returnType?: BaseType,
        /**
         * Parsed only when {@link getReturnType} is called. Schema emission does not
         * read return types; `ReturnType<T>` does. Deferring avoids walking fluent
         * generic methods that return a new instantiation of the enclosing class.
         */
        private resolveReturnType?: () => BaseType | undefined,
    ) {
        super();

        if (node) {
            this.comment = `(${node.parameters.map((p) => p.getFullText()).join(",")}) =>${node.type?.getFullText()}`;
        }
    }

    public getId(): string {
        return "function";
    }

    public getComment(): string | undefined {
        return this.comment;
    }

    public getNamedArguments(): ObjectType | undefined {
        return this.namedArguments;
    }

    public getReturnType(): BaseType | undefined {
        if (this.resolveReturnType) {
            const resolve = this.resolveReturnType;
            // Drop the resolver before running it so a return type that refers
            // back to this same function cannot recurse through it.
            this.resolveReturnType = undefined;
            this.returnType = resolve();
        }

        return this.returnType;
    }
}
