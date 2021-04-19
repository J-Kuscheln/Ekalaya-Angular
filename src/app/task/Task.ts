import { Member } from './../member/Member';
export interface Task{
    id:number;
    name:string;
    description:string;
    status:string;
    createdDate:Date;
    modifiedDate:Date;
    dueDate:Date;
    project:string;
    members:string[];
}