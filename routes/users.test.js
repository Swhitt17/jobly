process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db.js");


const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
    u1Token,
    u2Token,
    adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/**  username, firstName, lastName, email, isAdmin */


/********************************************* POST /users tests */

describe('POST /users', () => {
    test("admin allowed, makes non-admin user", async () => {
        const res = await request(app)
        .post(`/users`)
        .send({
           username: "new" ,
           firstName:"new" ,
           lastName:"user" ,
           password: "newPassword",
           email: "newuser@email.com",
           isAdmin: false
        })
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            user: {
                username: "new" ,
                firstName:"new" ,
                lastName:"user" ,
                email: "newuser@email.com",
                isAdmin: false,
            }, token: expect.any(String),
         });
    });

    test("admin allowed, makes admin ", async () => {
        const res = await request(app)
        .post(`/users`)
        .send({
           username: "new" ,
           firstName:"new" ,
           lastName:"user" ,
           password: "newPassword",
           email: "newuser@email.com",
           isAdmin: true
        })
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            user: {
                username: "new" ,
                firstName:"new" ,
                lastName:"user" ,
                email: "newuser@email.com",
                isAdmin: true,
            }, token: expect.any(String),
         });
    });


    test("user not allowed", async () => {
        const res = await request(app)
        .post(`/users`)
        .send({
            username: "new" ,
            firstName:"new" ,
            lastName:"user" ,
            email: "newuser@email.com",
            isAdmin: true,
        })
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(401);
    });

    test(" unrecognized user not allowed", async () => {
        const res = await request(app)
        .post(`/users`)
        .send({
            username: "new" ,
            firstName:"new" ,
            lastName:"user" ,
            email: "newuser@email.com",
            isAdmin: true,
        })
        expect(res.statusCode).toEqual(401);
    });


    test("Responds with 400 for missing data", async () => {
        const res = await request(app)
        .post(`/users`)
        .send({ username: "new" ,
                firstName:"new" })
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(400);
    });

    test("Responds with 400 for invalid data", async () => {
        const res = await request(app)
        .post(`/users`)
        .send({ username: "new" ,
                firstName: 484,
                lastName:"user" ,
                email: "newuser@email.com",
                isAdmin: true,
             })
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(400);
    });
});

/********************************************* GET /users tests */


describe('GET /users', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .get(`/users`)
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            users:
            [
                {
                    username:"u1" ,
                    firstName:'U1F' ,
                    lastName:'U1L' ,
                    email: 'u1@email.com',
                    isAdmin: false
                },
                {
                    username:"u2" ,
                    firstName:'U2F' ,
                    lastName:'U2L' ,
                    email: 'u2@email.com',
                    isAdmin: false
               },
               {
                username:"u3" ,
                firstName:'U3F' ,
                lastName:'U3L' ,
                email: 'u3@email.com',
                isAdmin: false
               },

            ],
        
        });
    });

    test("user not allowed", async () => {
        const res = await request(app)
        .get(`/users`)
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(401);
    });

    test(" unrecognized user not allowed", async () => {
        const res = await request(app)
        .get(`/users`)
        expect(res.statusCode).toEqual(401);
    });

});

/********************************************* GET /users/:username tests */

describe('GET /users/:username', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            user:  {
               username:"u1" ,
               firstName:'U1F' ,
               lastName:'U1L' ,
              email: 'u1@email.com',
              isAdmin: false,
              application: [testJobIds[0]]

            }
        });
    });

    test("user allowed for own", async () => {
        const res = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            user:  {
               username:"u1" ,
               firstName:'U1F' ,
               lastName:'U1L' ,
              email: 'u1@email.com',
              isAdmin: false,
              application: [testJobIds[0]]

            }
        });
    });

    test("other users not allowed ", async () => {
        const res = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${u2Token}`);
        expect(res.statusCode).toEqual(401);
        
        
    });

    test(" unrecognized user not allowed ", async () => {
        const res = await request(app)
        .get(`/users/u1`)
        expect(res.statusCode).toEqual(401);
        
        
    });

    test("Responds with 404 for invalid username", async () => {
        const res = await request(app)
        .get(`/users/incorrect`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    })
});


/********************************************* PATCH /users/:username tests */

describe('PATCH /users/:username', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .patch(`/users/u1`)
        .send({lastName:'U1NL' })
       .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({user: 
            {username:"u1" ,
             firstName:'U1F' ,
             lastName:'U1NL' ,
             email: 'u1@email.com',
             isAdmin : false}})
    });
    test("user allowed on own", async () => {
        const res = await request(app)
        .patch(`/users/u1`)
        .send({lastName:'U1NL' })
       .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({user: 
            {username:"u1" ,
             firstName:'U1F' ,
             lastName:'U1NL' ,
             email: 'u1@email.com',
            isAdmin : false}})
    });

    test("other users not allowed", async () => {
        const res = await request(app)
        .patch(`/users/u1`)
        .send({lastName:'U1NL' })
        .set("authorization", `Bearer ${u2Token}`);
        expect(res.statusCode).toEqual(401);
    });


    test("unrecognized user not allowed", async () => {
        const res = await request(app)
        .patch(`/users/u1`)
        .send({lastName:'U1NL' })
        expect(res.statusCode).toEqual(401);
    });

    test("Responds with 400 for invalid data", async () => {
        const res = await request(app)
        .patch(`/users/u1`)
        .send({lastName: 789 })
       .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(400);
    });


    test("Responds with 404 for invalid username", async () => {
        const res = await request(app)
        .patch(`/users/incorrect`)
        .send({lastName:'U1NL' })
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    });

});

/********************************************* DELETE /users/:username tests */


describe('DELETE /users/:username', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({deleted: 'u1'});
    });

    test("user allowed on own", async () => {
        const res = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({deleted: 'u1'});
    });

    test("other users not allowed", async () => {
        const res = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${u2Token}`);
        expect(res.statusCode).toEqual(401);
       
    });

    test("unrecognized user not allowed", async () => {
        const res = await request(app)
        .delete(`/users/u1`)
        expect(res.statusCode).toEqual(401);
       
    });

    test("Responds with 404 for invalid username", async () => {
        const res = await request(app)
        .delete(`/users/incorrect`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    });
});


/********************************************* POST /users/username/jobs/:id  */


describe('POST /users/:username/jobs/:id', () => {
    test("admin allowed", async () => {
        const res = await request(app)
        .post(`/users/u1/jobs/${testJobIds[1]}`)
       .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({applied: testJobIds[1]})

});

test("user allowed on own", async () => {
    const res = await request(app)
    .post(`/users/u1/jobs/${testJobIds[1]}`)
   .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({applied: testJobIds[1]})

});

test(" other users not allowed", async () => {
    const res = await request(app)
    .post(`/users/u1/jobs/${testJobIds[1]}`)
   .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(401);
});

test(" unrecognized user not allowed", async () => {
    const res = await request(app)
    .post(`/users/u1/jobs/${testJobIds[1]}`)
    expect(res.statusCode).toEqual(401);
});


test("Responds with 404 for invalid username", async () => {
    const res = await request(app)
    .get(`/users/incorrect`)
    .set("authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(404);
});

test("Responds with 404 for invalid job id", async () => {
    const res = await request(app)
    .get(`/users/u1/jobs/0`)
    .set("authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(404);
});

});