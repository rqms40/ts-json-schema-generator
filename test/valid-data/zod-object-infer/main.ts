// Hand-written reduction of the zod 3 declaration types for `z.infer<z.ZodObject<...>>`.
// `augment` is a function-typed property (not a method) whose return type is a new
// ZodObject instantiation, so eagerly parsing that return type does not terminate.

export declare abstract class ZodType<Output = any, Input = Output> {
    readonly _output: Output;
    readonly _input: Input;
}

export type ZodTypeAny = ZodType<any, any>;

type ZodRawShape = { [k: string]: ZodTypeAny };
type UnknownKeysParam = "passthrough" | "strict" | "strip";

type extendShape<A extends object, B extends object> = {
    [K in keyof A as K extends keyof B ? never : K]: A[K];
} & {
    [K in keyof B]: B[K];
};

type baseObjectOutputType<Shape extends ZodRawShape> = {
    [k in keyof Shape]: Shape[k]["_output"];
};

type objectOutputType<
    Shape extends ZodRawShape,
    Catchall extends ZodTypeAny,
    UnknownKeys extends UnknownKeysParam,
> = baseObjectOutputType<Shape>;

export declare class ZodString extends ZodType<string, string> {}
export declare class ZodNumber extends ZodType<number, number> {}

export declare class ZodObject<
    T extends ZodRawShape,
    UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
    Catchall extends ZodTypeAny = ZodTypeAny,
    Output = baseObjectOutputType<T>,
    Input = baseObjectOutputType<T>,
> extends ZodType<Output, Input> {
    nonstrict: () => ZodObject<T, "passthrough", Catchall>;
    augment: <Augmentation extends ZodRawShape>(
        augmentation: Augmentation,
    ) => ZodObject<
        extendShape<T, Augmentation>,
        UnknownKeys,
        Catchall,
        objectOutputType<extendShape<T, Augmentation>, Catchall, UnknownKeys>,
        objectOutputType<extendShape<T, Augmentation>, Catchall, UnknownKeys>
    >;
}

export type TypeOf<T extends ZodType<any, any>> = T["_output"];

export type BookShape = { title: ZodString; pages: ZodNumber };
export type BookData = { title: string; pages: number };

export interface Library {
    name: string;
    books: TypeOf<ZodObject<BookShape, "strip", ZodTypeAny, BookData, BookData>>[];
}
