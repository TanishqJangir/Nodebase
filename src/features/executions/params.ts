import {parseAsInteger, parseAsString} from "nuqs/server";
import { PAGINATION } from "@/config/constants";

export const executionsParams = {
    page : parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE)
        .withOptions({clearOnDefault : true}), // no need for localhost:3000/executions?page=1
    
    pageSize : parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
        .withOptions({clearOnDefault : true}),
};
