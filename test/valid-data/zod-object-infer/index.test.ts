import { test } from "node:test";
import { assertValidSchema } from "../../utils";

test("valid-data - zod-object-infer", assertValidSchema("zod-object-infer", "Library"));
