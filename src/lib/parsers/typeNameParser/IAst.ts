export interface IAst{
    partialTypeName: string;
    genericParams: IAst[];
    geneticTypeParam: string;
    composingTypes: IAst[];
    fullTypeName: string;
}
