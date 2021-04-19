export interface Member{
    
    /*
        {   "id":"13401548-df30-4a4c-8ee0-ad59f81b14ab",
            "firstName":"Rozaan Wiryanto",
            "lastName":"asfd",
            "photoUrl":null,
            "position":"asfasfd",
            "email":"asdfasdf",
            "phone":"asdfas",
            "birthday":"4567-03-12",
            "joinDate":"2021-02-22T23:46:36.000+00:00",
            "modifiedDate":"2021-02-22T23:46:36.000+00:00",
            "leadedProjects":[],
            "memberProjects":[],
            "finishedProjects":[]}
    */

    id: String; 
    firstName: String;
    lastName: String;
    photoUrl: String;
    position: String;
    email: String;
    phone: String;
    birthday: String;
    leadedProjects: String[];
    memberProjects: String[];
    finishedProjects: String[];



}