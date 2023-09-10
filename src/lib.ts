

interface Category {
    name: string;
    uuid: string;
    isVisable: boolean;
}
class CategoryEntry {
    uuid: string;
    value: number;

    constructor(uuid: string, value: number) {
        this.uuid = uuid;
        this.value = value;
    };
}

interface User {
    name: string;
    uuid: string;
    entries: Array<CategoryEntry>;
}





export { Category, CategoryEntry, User }