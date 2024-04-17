"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const testJob = {
    title: "new",
    salary: 50000,
    equity: "0",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(testJob);
    expect(job).toEqual({
      ...testJob,
      id: expect.any(Number),
    });
  });

});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "Job1",
        salary: 55000,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1"
      },
      {
        id: testJobIds[1],
        title: "Job2",
        salary: 57000,
        equity: "0.03",
        companyHandle: "c1",
        companyName: "C1"
      },
      {
        id: testJobIds[2],
        title: "Job3",
        salary: 59000,
        equity: "0.06",
        companyHandle: "c1",
        companyName: "C1"
      },
    ]);
  });
  test("min salary filter works", async() => {
    let jobs = await Job.findAll({ minSalary: 59000 });
    expect (jobs).toEqual([
      {
        id: testJobIds[2],
        title: "Job3",
        salary: 59000,
        equity: "0.06",
        companyHandle: "c1",
        companyName: "C1"

      },
    ]);
  });

  test("has equity filter works", async() => {
    let jobs = await Job.findAll({ hasEquity: true });
    expect (jobs).toEqual([
      {
        id: testJobIds[1],
        title: "Job2",
        salary: 57000,
        equity: "0.03",
        companyHandle: "c1",
        companyName: "C1"

      },
      {
         id: testJobIds[2],
        title: "Job3",
        salary: 59000,
        equity: "0.06",
        companyHandle: "c1",
        companyName: "C1"
      },
    ]);
  });
  test("name filter works", async() => {
    let jobs = await Job.findAll({ title: "b1" });
    expect (jobs).toEqual([
      {
        id: testJobIds[0],
        title: "Job1",
        salary: 55000,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1"

      },
    ]);
  });

});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
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
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
        title: "Job1",
        salary: 55200,
        equity: "0",
  };

  test("works", async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
      id: testJobIds[0],
      companyHandle: "c1",
      ...updateData,
    });
  });
    

  test("not found if no such job", async function () {
    try {
      await Job.update(0,{
        title: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});



/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query(
        `SELECT id FROM jobs WHERE id=$1`, [testJobIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
