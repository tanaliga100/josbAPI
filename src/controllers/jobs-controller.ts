import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors";
import { IUser } from "../interfaces/all.interfaces";
import { asyncMiddleware } from "../middlewares/async-middleware";
import Job from "../models/job-model";

const GET_JOBS = asyncMiddleware(
  async (req: any, res: Response, next: NextFunction) => {
    // GET THE JOBS ASSOCIATED WITH CURRENT USER;
    console.log("FROM CONTROLLER", req.user);
    const job = await Job.find({ createdBy: req.user._id }).sort("createdAt");
    res
      .status(StatusCodes.OK)
      .json({ msg: "ALL_JOBS", length: job.length, job });
  }
);

const GET_JOB = asyncMiddleware(
  async (req: any, res: Response, next: NextFunction) => {
    const {
      user: { _id },
      params: { id: jobId },
    } = req;
    const job = await Job.findOne({ _id: jobId, createdBy: _id });
    if (!job) {
      throw new NotFoundError("NO JOB ASSOCIATED WITH ID :" + jobId);
    }
    res.status(StatusCodes.OK).json({ msg: "SINGLE_JOB ", job });
  }
);

const CREATE_JOB = asyncMiddleware(
  async (req: any, res: Response, next: NextFunction) => {
    const { company, position, status } = req.body;
    req.body.createdBy = req.user._id;
    const job = await Job.create(req.body);
    res.status(StatusCodes.CREATED).json({ job });
  }
);

const UPDATE_JOB = asyncMiddleware(
  async (req: any, res: Response, next: NextFunction) => {
    const {
      user: { _id },
      params: { id: jobId },
      body: { company, position },
    } = req;
    if (company === "" || position === "") {
      throw new BadRequestError("Company or Position must be specified");
    }
    const job = await Job.findOneAndUpdate(
      { _id: jobId, createdBy: _id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!job) {
      throw new NotFoundError("NO JOB ASSOCIATED WITH ID :" + jobId);
    }
    res.status(StatusCodes.OK).json({ msg: "UPDATED_JOB ", job });
  }
);

const DELETE_JOB = asyncMiddleware(
  async (req: any, res: Response, next: NextFunction) => {
    const {
      user: { _id },
      params: { id: jobId },
    } = req;
    const job = await Job.findOneAndDelete({
      _id: jobId,
      createdBy: _id,
    });
    if (!job) {
      throw new NotFoundError(`JOB WITH THIS ID : ${jobId} DOESNT EXIST`);
    }
    const updated = await Job.find({}).sort("createdBy");
    res.status(StatusCodes.OK).send({ msg: "JOB_DELETED", updated });
  }
);
export { CREATE_JOB, DELETE_JOB, GET_JOB, GET_JOBS, UPDATE_JOB };
