process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
    u1Token,
    adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/**************************** POST tests */

describe('POST /companies', () => {
    const testCompany = {

    handle: "test3",
    name: "testing3",
    description: "test test test",
    numEmployees: 200,
    logoUrl:'http://new.img' 
    }

    test("admin allowed", async () => {
        const res = await request(app)
        .post(`/companies`)
        .send(testCompany)
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({ company: testCompany})
    });

    test("user not allowed", async () =>{
        const res = await request(app)
        .post(`/companies`)
        .send(testCompany)
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(401);
    });

    test("missing data", async () =>{
        const res = await request(app)
        .post(`/companies`)
        .send({handle: "test3",
           name: "testing3"})
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(400);
       
    });

    test("invalid data type", async () =>{
        const res = await request(app)
        .post(`/companies`)
    .send({handle: "test3",
           name: 345})
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(400);
        
    });


});

/**************************** GET /companies tests */

describe('GET /companies', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .get(`/companies`)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ 
            companies: [
                {
                handle: "c1",
                name: "C1",
                numEmployees: 1,
                description:'Desc1',
                logoUrl:'http://c1.img'
            },
            {
               handle: "c2",
               name: "C2",
               numEmployees: 2,
               description:'Desc2',
               logoUrl:'http://c2.img'
            },
            {
                handle: "c3",
                name: "C3",
                numEmployees: 3,
                description:'Desc3',
                logoUrl:'http://c3.img' 
            },
            ], 
         });
    });

    test("one filter works", async() => {
        const res = await request(app)
        .get(`/companies`)
        .query({name: 'C3'});
        expect(res.body).toEqual({ 
            companies: [
              {
                handle: "c3",
                name: "C3",
                numEmployees: 3,
                description:'Desc3',
                logoUrl:'http://c3.img'
             },
           ],
        });
    });

    test("all filters work", async() => {
        const res = await request(app)
        .get(`/companies`)
        .query({minEmployees:1, maxEmployees: 2, name: '2'});
        expect(res.body).toEqual({ 
            companies: [
              {
                handle: "c2",
                name: "C2",
                numEmployees: 2,
                description:'Desc2',
                logoUrl:'http://c2.img'
              },
            ],
        });
    });

    test("invalid filter doesn't work", async() => {
        const res = await request(app)
        .get(`/companies`)
        .query({bad: "incorrect"});
        expect(res.statusCode).toEqual(400);
     
    });
    });

/**************************** GET /companies/:handle tests */

describe('GET /companies/:handle', () => {
    test("everyone works", async () => {
        const res = await request(app)
        .get(`/companies/c1`);
        expect(res.body).toEqual({
            company: {
                handle: "c1",
                name: "C1",
                numEmployees: 1,
                description:'Desc1',
                logoUrl:'http://c1.img',
                jobs: [
                  { id: testJobIds[0], title: 'Job1', salary: 55000, equity: "0", },
                  { id: testJobIds[1], title: 'Job2', salary: 57000, equity: "0.03", },
                  { id: testJobIds[2], title: 'Job3', salary: 59000, equity: "0.06", }    
                ],
           },
        });
    });

    test("everyone works, company with no jobs", async () => {
        const res = await request(app)
        .get(`/companies/c2`);
        expect(res.body).toEqual({
            company: {
               handle: "c2",
               name: "C2",
               numEmployees: 2,
               description:'Desc2',
               logoUrl:'http://c2.img',
               jobs: [],
            }, 
       });
    });


    test("Responds with 404 for invalid handle", async () => {
        const res = await request(app)
        .get(`/companies/aaa`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    })
});

/**************************** PATCH tests */

describe('PATCH /companies/:handle', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .patch(`/companies/c1`)
        .send({description: 'A cool description'})
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({company: {
          handle: "c1",
          name: "C1",
          numEmployees: 1,
          description:"A cool description",
          logoUrl:'http://c1.img' }} )
    });

    test("user not allowed", async () => {
        const res = await request(app)
        .patch(`/companies/c1`)
        .send({description: "A cool description"})
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(401);
    });

    test("unrecognized user not allowed", async () => {
        const res = await request(app)
        .patch(`/companies/c1`)
        .send({description: "A cool description"})
        expect(res.statusCode).toEqual(401);
    });

    test("invalid data", async () => {
        const res = await request(app)
        .patch(`/companies/c1`)
        .send({description: 123})
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(400);
    });

    test("Responds with 404 for invalid handle", async () => {
        const res = await request(app)
        .get(`/companies/aaa`);
        expect(res.statusCode).toEqual(404);
    })
});

 
    /**************************** DELETE /companies tests */

describe('DELETE /companies/:handle', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .delete(`/companies/c1`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.body).toEqual({ deleted: "c1" })
    });


    test("user not allowed", async () => {
        const res = await request(app)
        .delete(`/companies/c1`)
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(401);
    });

    test("unrecognized user not allowed", async () => {
        const res = await request(app)
        .patch(`/companies/c1`)
        expect(res.statusCode).toEqual(401);
    });

    test("Responds with 404 for invalid handle", async () => {
        const res = await request(app)
        .delete(`/companies/aaa`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    })


    /** test for user, no token, and 404 */

   
});
