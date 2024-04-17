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

/***************************************** POST /jobs*/
/** title,salary,equity,companyHandle */

describe('POST /jobs', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .post(`/jobs`)
        .send({ 
          title: "new",
          salary: 85000,
          equity: "0",
          companyHandle: "c1"
        })
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            job:{
                id: expect.any(Number),
                title: "new",
                salary: 85000,
                equity: "0",
                companyHandle: "c1"
        },
      });
    });

    test("user not allowed", async () => {
        const res = await request(app)
        .post(`/jobs`)
        .send({
            title: "new",
            salary: 85000,
            equity: "0",
            companyHandle: "new"
        })
        .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(401); 
});

   test(" unrecognized user not allowed", async () => {
    const res = await request(app)
    .post(`/jobs`)
    .send({
        title: "new",
        salary: 85000,
        equity: "0",
        companyHandle: "new"
    })
    expect(res.statusCode).toBe(401);
});

test("Responds with 400 for missing data", async () => {
    const res = await request(app)
    .post(`/jobs`)
    .send({ title: "new"})
    .set("authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(400);
    
});


test("Responds with 400 for invalid data", async () => {
    const res = await request(app)
    .post(`/jobs`)
    .send({salary: "an amount"})
    .set("authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(400);
    
});


});

/***************************************** GET /jobs*/
/** minSalary, hasEquity, title */
describe('GET /jobs', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .get(`/jobs`)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ 
            jobs:
            [
             {
                id: expect.any(Number),
                title: "Job1",
                salary: 55000,
                equity: "0",
                companyHandle: "c1",
                companyName: "C1"
              },
              {
                id: expect.any(Number),
                title: "Job2",
                salary: 57000,
                equity: "0.03",
                companyHandle: "c1",
                companyName: "C1"

              },
              {
                id: expect.any(Number),
                title: "Job3",
                salary: 59000,
                equity: "0.06",
                companyHandle: "c1",
                companyName: "C1"
              },
            ],
         });
    });

    test("one filter works", async() => {
        const res = await request(app)
        .get(`/jobs`)
        .query({title: "2"});
        expect(res.body).toEqual({ 
            jobs: [
               {
                 id: expect.any(Number),
                 title: "Job2",
                 salary: 57000,
                 equity: "0.03",
                 companyHandle: "c1",
                 companyName: "C1"
               },
            ],
        },
      );
    });

    test("2 filters work", async() => {
        const res = await request(app)
        .get(`/jobs`)
        .query({ minSalary: 59000, title: "3"});
        expect(res.body).toEqual({ 
            jobs: [
             {
                id: expect.any(Number),
                title: "Job3",
                salary: 59000,
                equity: "0.06",
                companyHandle: "c1", 
                companyName: "C1"
             },
           ],
        },
      );
    });

    test("Responds with 400 for bad filter", async() => {
        const res = await request(app)
        .get(`/jobs`)
        .query({ minSalary:55000, bad:'incorrect'});
        expect(res.statusCode).toEqual(400);
     
    });

});

/***************************************** GET /jobs/:id */

describe('GET /jobs/:id', () => {
    test("works for everyone", async () => {
        const res = await request(app)
        .get(`/jobs/${testJobIds[0]}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            job:{
                id: testJobIds[0],
                title: "Job1",
                salary: 55000,
                equity: "0",
                company: {
                    handle: "c1",
                    name: "C1",
                    numEmployees: 1,
                    description:'Desc1',
                    logoUrl:'http://c1.img'
                },
            },
         });
    });

    test("Responds with 404 for invalid id", async () => {
        const res = await request(app)
        .get(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    });
});
/***************************************** PATCH /jobs/:id */


describe('PATCH /jobs/:id', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({title: "really cool job"})
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.body).toEqual({
            job: {
              id: expect.any(Number),
              title: "really cool job",
              salary: 55000,
              equity: "0",
              companyHandle: "c1"
            },
        });
    });

    test("user not allowed", async () => {
        const res = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({title: "really cool job"})
        .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(401);
    });

    test(" unrecognized user not allowed", async () => {
        const res = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({title: "really cool job"})
        expect(res.statusCode).toEqual(401);
    });


 test("Responds with 400 for invalid data", async () => {
        const res = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({title: 987})
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(400);
        
    });


    test("Responds with 404 for invalid id", async () => {
        const res = await request(app)
        .get(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    })
});

/***************************************** DELETE /jobs/:id */

describe('DELETE /jobs/:id', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({deleted: testJobIds[0]})
    });

    test("user not allowed", async () => {
        const res = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(401);
    });

    test(" recognized user not allowed", async () => {
        const res = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        expect(res.statusCode).toEqual(401);
    });


    test("Responds with 404 for invalid id", async () => {
        const res = await request(app)
        .get(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    })
});




   
