import { Task } from './../task/Task';
import { Member } from '../member/Member';

export interface Project{
    /*
        {"id":1,
        "name":"project 1",
        "status":"Finished",
        "description":"123hello",
        "createdDate":null,
        "modifiedDate":null,
        "projectLeaders":[],
        "projectMembers":[],
        "milestones":null}
    */
    id: number;
    name: String;
    status: String;
    description: String;
    projectLeaders: String[];
    projectMembers: String[];
    tasks:number[];
}