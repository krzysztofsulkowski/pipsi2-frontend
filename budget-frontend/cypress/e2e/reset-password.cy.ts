describe('Reset password page', () => {
    it('should show invalid or expired link message when token is missing', () => {
        cy.visit('http://localhost:3000/reset-password')

        cy.contains(/Link do resetu/i).should('be.visible')
        cy.contains(/nieprawid/i).should('be.visible')
        cy.contains(/wygas/i).should('be.visible')
    })

})

describe('Reset password page', () => {
    it('should display new password form when token and email are provided', () => {
        cy.visit('http://localhost:3000/reset-password?token=test-token&email=test@test.pl')

        cy.get('input[type="password"]').should('have.length', 2)
        cy.get('input[type="password"]').eq(0).should('be.visible')
        cy.get('input[type="password"]').eq(1).should('be.visible')
        cy.get('button[type="submit"]').should('be.visible')
        cy.contains('test@test.pl').should('be.visible')
    })
})

describe('Reset password page', () => {
    it('should not submit form when passwords are different', () => {
        cy.visit('http://localhost:3000/reset-password?token=test-token&email=test@test.pl')

        cy.intercept('POST', '**/api/authentication/reset-password').as('resetPassword')

        cy.get('input[type="password"]').eq(0).type('Password123!')
        cy.get('input[type="password"]').eq(1).type('Password123!!')

        cy.get('button[type="submit"]').click()

        cy.wait(1000)
        cy.get('@resetPassword.all').should('have.length', 0)
    })
})

describe('Reset password page', () => {
    it('should not submit when password does not meet policy', () => {
        cy.visit('http://localhost:3000/reset-password?token=test-token&email=test@test.pl')

        cy.intercept('POST', '**/api/authentication/reset-password').as('resetPassword')

        cy.get('input[type="password"]').eq(0).type('abc')
        cy.get('input[type="password"]').eq(1).type('abc')

        cy.get('button[type="submit"]').click()

        cy.wait(1000)
        cy.get('@resetPassword.all').should('have.length', 0)
    })
})

describe('Reset password page', () => {
    it('should submit form when passwords are valid and matching', () => {
        cy.visit('http://localhost:3000/reset-password?token=test-token&email=test@test.pl')

        cy.intercept('POST', '**/api/authentication/reset-password', {
            statusCode: 200,
            body: {}
        }).as('resetPassword')

        cy.get('input[type="password"]').eq(0).type('Password123!')
        cy.get('input[type="password"]').eq(1).type('Password123!')

        cy.get('button[type="submit"]').click()

        cy.wait('@resetPassword').its('request.body').should((body) => {
            expect(body).to.have.property('token', 'test-token')
            expect(body).to.have.property('email', 'test@test.pl')
            expect(body).to.have.property('newPassword', 'Password123!')
        })
    })
})

describe('Reset password page', () => {
    it('should show error message when backend returns error', () => {
        cy.visit('http://localhost:3000/reset-password?token=test-token&email=test@test.pl')

        cy.intercept('POST', '**/api/authentication/reset-password', {
            statusCode: 400,
            body: {
                message: 'Invalid or expired reset token'
            }
        }).as('resetPassword')

        cy.get('input[type="password"]').eq(0).type('Password123!')
        cy.get('input[type="password"]').eq(1).type('Password123!')

        cy.get('button[type="submit"]').click()

        cy.wait('@resetPassword')

        cy.contains(/invalid|expired/i).should('be.visible')

    })
})

describe('Reset password page', () => {
    it('should not send reset password request more than once', () => {
        cy.visit('http://localhost:3000/reset-password?token=test-token&email=test@test.pl')

        cy.intercept('POST', '**/api/authentication/reset-password', {
            delay: 1000,
            statusCode: 200,
            body: {}
        }).as('resetPassword')

        cy.get('input[type="password"]').eq(0).type('Password123!')
        cy.get('input[type="password"]').eq(1).type('Password123!')

        cy.get('button[type="submit"]').click().click().click()

        cy.wait('@resetPassword')
        cy.get('@resetPassword.all').should('have.length', 1)
    })
})




