
const { sqlForPartialUpdate } = require("./sql");



describe ("sqlforPartialUpdate", () => {
    test(" works with one field", async () => {
        const result = sqlForPartialUpdate (
            {f1: "v1"},
            {f1: "f1", fF2: "f2"});
            expect(result).toEqual({
                setCols: "\"f1\"=$1",
                values: ["v1"],
            });
    });

    test(" works with two fields", async () => {
        const result = sqlForPartialUpdate (
            {f1: "v1", jsF2: "v2"},
            {jsF2: "f2"});
            expect(result).toEqual({
                setCols: "\"f1\"=$1, \"f2\"=$2",
                values: ["v1", "v2"],
            });
    });


});