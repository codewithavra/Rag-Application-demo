import e from "express";

export const app = e();

app.use(e.urlencoded({
    extended : true,
    limit : '10kb'
}))

app.use(e.json({ limit : '10kb' }))

