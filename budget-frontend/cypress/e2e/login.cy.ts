describe('Login page', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/login')
    })

    it('should display login form', () => {
        cy.contains('Logowanie').should('be.visible')
        cy.get('#email').should('be.visible')
        cy.get('#password').should('be.visible')
        cy.contains('Zaloguj się').should('be.visible')
    })

    it('should show error on invalid credentials', () => {
        cy.get('#email').type('wrong@example.com')
        cy.get('#password').type('wrongpassword')
        cy.contains('Zaloguj się').click()
        cy.contains('Blad:').should('be.visible')
    })

    it('should login successfully and redirect to dashboard', () => {
        cy.get('#email').type(Cypress.env('TEST_USER_EMAIL'))
        cy.get('#password').type(Cypress.env('TEST_USER_PASSWORD'))
        cy.contains('Zaloguj się').click()

        cy.url().should('include', '/dashboard')

        cy.window().then((win) => {
            expect(win.localStorage.getItem('authToken')).to.not.be.null
        })
    })

    it('should redirect unauthenticated user from dashboard to landing page', () => {
        cy.clearLocalStorage()
        cy.visit('http://localhost:3000/dashboard')
        cy.url().should('include', '/landing-page')
    })

    it('should stay logged in after page refresh', () => {
        cy.get('#email').type(Cypress.env('TEST_USER_EMAIL'))
        cy.get('#password').type(Cypress.env('TEST_USER_PASSWORD'))
        cy.contains('Zaloguj się').click()

        cy.url().should('include', '/dashboard')

        cy.reload()

        cy.url().should('include', '/dashboard')
    })

    it('should logout user when auth token is cleared', () => {
        cy.get('#email').type(Cypress.env('TEST_USER_EMAIL'))
        cy.get('#password').type(Cypress.env('TEST_USER_PASSWORD'))
        cy.contains('Zaloguj się').click()

        cy.url().should('include', '/dashboard')

        cy.window().then((win) => {
            win.localStorage.removeItem('authToken')
        })

        cy.visit('http://localhost:3000/dashboard')

        cy.url().should('include', '/landing-page')
    })

    it('should load user data on dashboard after login', () => {
        cy.get('#email').type(Cypress.env('TEST_USER_EMAIL'))
        cy.get('#password').type(Cypress.env('TEST_USER_PASSWORD'))
        cy.contains('Zaloguj się').click()

        cy.url().should('include', '/dashboard')

        cy.contains('Cześć').should('be.visible')
        cy.contains('Nie masz jeszcze żadnego budżetu').should('be.visible')
    })

    it('should block login when password is incorrect', () => {
        cy.get('#email').type(Cypress.env('TEST_USER_EMAIL'))
        cy.get('#password').type('WrongPassword123')
        cy.contains('Zaloguj się').click()

        cy.url().should('include', '/login')
        cy.contains(/blad|nieprawidłowe|error/i).should('be.visible')

        cy.window().then((win) => {
            expect(win.localStorage.getItem('authToken')).to.be.null
        })
    })
})
