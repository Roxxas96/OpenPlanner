import { FastifyInstance } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import { FaqDao } from '../dao/faqDao'

const FaqCategory = Type.Object({
    id: Type.String(),
    name: Type.String(),
    order: Type.Number(),
    share: Type.Boolean(),
    private: Type.Optional(Type.Boolean()),
    privateId: Type.Optional(Type.String()),
})
export type FaqCategoryType = Static<typeof FaqCategory>

export const Faq = Type.Object({
    categoryId: Type.String(),
    categoryName: Type.Optional(Type.String()),
    question: Type.String(),
    answer: Type.String(),
    order: Type.Number(),
    categoryOrder: Type.Number(),
})

export type FaqType = Static<typeof Faq>

const Reply = Type.Object({ faqItemId: Type.String() })
type FaqReply = Static<typeof Reply>

const GetReply = Type.Object({
    faq: Type.Array(
        Type.Object({
            category: FaqCategory,
            questions: Type.Array(Faq),
        })
    ),
})
type GetReplyType = Static<typeof GetReply>

export const faqRoutes = (fastify: FastifyInstance, options: any, done: () => any) => {
    fastify.post<{ Body: FaqType; Reply: FaqReply }>(
        '/v1/:eventId/faq',
        {
            schema: {
                tags: ['faq'],
                summary: 'Add a new item in the FAQ',
                body: Faq,
                response: {
                    201: Reply,
                    400: Type.String(),
                },
                security: [
                    {
                        apiKey: [],
                    },
                ],
            },
            preHandler: fastify.auth([fastify.verifyApiKey]),
        },
        async (request, reply) => {
            const { eventId } = request.params as { eventId: string }

            const faqItemId = await FaqDao.addFaqQuestion(fastify.firebase, eventId, {
                ...request.body,
            })

            reply.status(201).send({
                faqItemId,
            })
        }
    )
    fastify.get<{ Reply: GetReplyType }>(
        '/v1/:eventId/faq/:faqPrivateId',
        {
            schema: {
                tags: ['faq'],
                summary:
                    'Get the FAQ details (publicly used by OpenPlanner public frontend). If you pass a faqPrivateId, it will only return the private FAQ for that ID',
                response: {
                    200: GetReply,
                    400: Type.String(),
                },
            },
        },
        async (request, reply) => {
            const { eventId, faqPrivateId } = request.params as { eventId: string; faqPrivateId: string }

            const output = []

            const faqCategories = await FaqDao.getFaqPrivateCategory(fastify.firebase, eventId, faqPrivateId)

            for (const faqCategory of faqCategories) {
                const questions = await FaqDao.getFaqQuestions(fastify.firebase, eventId, faqCategory.id)

                const questionsWithCategoryInfo: FaqType[] = questions.map((question) => {
                    return {
                        ...question,
                        categoryId: faqCategory.id,
                        categoryName: faqCategory.name,
                        categoryOrder: faqCategory.order,
                    }
                })

                output.push({
                    category: faqCategory,
                    questions: questionsWithCategoryInfo,
                })
            }

            reply.status(200).send({
                faq: output,
            })
        }
    )
    done()
}