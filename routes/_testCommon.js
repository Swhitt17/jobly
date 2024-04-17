

const db = require("../db.js");
const Company = require("../models/company");
const User = require("../models/user");
const Job = require("../models/job");
const {createToken} = require("../helpers/tokens")

const testJobIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await Company.create({
   handle: "c1",
   name: "C1",
   numEmployees: 1,
   description:'Desc1',
   logoUrl:'http://c1.img'
  });

  await Company.create({
    handle: "c2",
    name: "C2",
    numEmployees: 2,
    description:'Desc2',
    logoUrl:'http://c2.img'
   });
   await Company.create({
    handle: "c3",
    name: "C3",
    numEmployees: 3,
    description:'Desc3',
    logoUrl:'http://c3.img'
   });

   testJobIds[0] = (await Job.create(
    {title: "Job1", salary: 55000, equity: "0", companyHandle: "c1"})).id;
        
   testJobIds[1] = (await Job.create(
    {title: "Job2", salary: 57000, equity: "0.03", companyHandle: "c1"})).id;
    
   testJobIds[2] = (await Job.create(
    {title: "Job3", salary: 59000, equity: "0.06", companyHandle: "c1"})).id;


  await User.register({
        username:"u1" ,
        password: 'password1',
        firstName:'U1F' ,
        lastName:'U1L' ,
        email: 'u1@email.com',
        isAdmin: false
     });
     
     
  await User.register({
    username:"u2" ,
    password: 'password2',
    firstName:'U2F' ,
    lastName:'U2L' ,
    email: 'u2@email.com',
    isAdmin: false
 });
 
 await User.register({
    username:"u3" ,
    password: 'password3',
    firstName:'U3F' ,
    lastName:'U3L' ,
    email: 'u3@email.com',
    isAdmin: false
 });

 await User.apply("u1", testJobIds[0]);
 
}


async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({username: "u1", isAdmin: false});
const u2Token = createToken({username: "u2", isAdmin: false});
const adminToken = createToken({username: "admin", isAdmin: true});


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  u2Token,
  adminToken
};