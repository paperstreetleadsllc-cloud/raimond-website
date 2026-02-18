import type { FastifyPluginAsync } from "fastify";

type AnswerObservation = {
  id: string;
  query: string;
  answer: string;
  source: string;
  capturedAt: string;
};

const answers: AnswerObservation[] = [];

export const answersRoutes: FastifyPluginAsync = async (app) => {
  app.get("/answers", async () => ({
    data: answers,
  }));
};
