

interface Category {
    name: string;
    uuid: string;
    isVisable: boolean;
}
class CategoryEntry {
    uuid: string;
    value: number;
    show: boolean;

    constructor(uuid: string, value: number, show : boolean ) {
        this.uuid = uuid;
        this.value = value;
        this.show = show;
    };
}

interface User {
    name: string;
    uuid: string;
    entries: Array<CategoryEntry>;
}





export { Category, CategoryEntry, User }