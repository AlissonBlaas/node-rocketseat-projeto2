import  { afterAll, beforeAll,beforeEach, it, describe, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'


describe('transactions routes', () => {

beforeAll(async () => {
    await app.ready()
})

afterAll(async () => {
    await app.close()
})

beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
})

    it('should be able to create a new transaction', async () => {
            await request(app.server).post('/transactions').send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            }).expect(201)
        
        })
        
    it('should be able list all transactions', async () => {
           const createTransactionResponse = await request(app.server)
           .post('/transactions')
           .send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            })

            const cookies = createTransactionResponse.get('Set-Cookie')

            const ListTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

            expect(ListTransactionsResponse.body.transactions).toEqual([
                expect.objectContaining({
                    title: 'New Transaction',
                    amount: 5000,
                }),
            ])

    })

    it('should be able to get specific transaction', async () => {
        const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
             title: 'New Transaction',
             amount: 5000,
             type: 'credit'
         })

         const cookies = createTransactionResponse.get('Set-Cookie')

         const ListTransactionsResponse = await request(app.server)
         .get('/transactions')
         .set('Cookie', cookies)
         .expect(200)

         const transactionId = ListTransactionsResponse.body.transactions[0].id

         const getTransactionResponse = await request(app.server)
         .get(`/transactions/${transactionId}`)
         .set('Cookie', cookies)
         .expect(200)


         expect(getTransactionResponse.body.transactions).toEqual(
             expect.objectContaining({
                 title: 'New Transaction',
                 amount: 5000,
             }),
         )

    })

    it('should be able  get the summary', async () => {
        const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
             title: 'Credit Transaction',
             amount: 5000,
             type: 'credit'
         })

         const cookies = createTransactionResponse.get('Set-Cookie')

         await request(app.server)
        .post('/transactions')
        .set('Cookie', cookies)
        .send({
             title: 'Debit Transaction',
             amount: 2000,
             type: 'debit'
         })

         const summaryResponse = await request(app.server)
         .get('/transactions/summary')
         .set('Cookie', cookies)
         .expect(200)

         expect(summaryResponse.body.summary).toEqual({
            amount: 3000
         })

    })

}) 

