describe('Register page', () => {
    it('should display registration form', () => {
        cy.visit('http://localhost:3000/register')

        cy.contains('Rejestracja').should('be.visible')
        cy.get('#email').should('be.visible')
        cy.get('#username').should('be.visible')
        cy.get('#password').should('be.visible')
        cy.get('#confirmPassword').should('be.visible')

        cy.get('button[type="submit"]').should('be.visible')
    })

    describe('Register page', () => {
        it('should block form submission when required fields are empty', () => {
            cy.visit('http://localhost:3000/register')

            cy.get('button[type="submit"]').click()

            cy.url().should('include', '/register')
        })
    })

    describe('Register page', () => {
        it('should block registration when email format is invalid', () => {
            cy.visit('http://localhost:3000/register')

            cy.get('#email').type('niepoprawnyemail')
            cy.get('#username').type('testuser')
            cy.get('#password').type('Test123!')
            cy.get('#confirmPassword').type('Test123!')

            cy.get('button[type="submit"]').click()

            cy.url().should('include', '/register')
        })
    })

    describe('Register page', () => {
        it('should block registration when passwords do not match', () => {
            cy.visit('http://localhost:3000/register')

            cy.get('#email').type('test_mismatch@test.pl')
            cy.get('#username').type('testuser')
            cy.get('#password').type('Test123!')
            cy.get('#confirmPassword').type('Test123!!')

            cy.get('button[type="submit"]').click()

            cy.url().should('include', '/register')
        })
    })

    describe('Register page', () => {
        it('should block registration when password does not meet policy', () => {
            cy.visit('http://localhost:3000/register')

            cy.get('#email').type('weakpass@test.pl')
            cy.get('#username').type('testuser')
            cy.get('#password').type('abc')
            cy.get('#confirmPassword').type('abc')

            cy.get('button[type="submit"]').click()

            cy.url().should('include', '/register')
        })
    })

    describe('Register page', () => {
        it('should register new user successfully and redirect to login', () => {
            cy.visit('http://localhost:3000/register')

            const email = `user_${Date.now()}@test.pl`
            const username = `user_${Date.now()}`

            cy.get('#email').type(email)
            cy.get('#username').type(username)
            cy.get('#password').type('Test123!')
            cy.get('#confirmPassword').type('Test123!')

            cy.get('button[type="submit"]').click()

            cy.url().should('include', '/login')
        })
    })

    describe('Register page', () => {
        it('should block registration when email already exists', () => {
            cy.visit('http://localhost:3000/register')

            cy.get('#email').type(Cypress.env('TEST_USER_EMAIL'))
            cy.get('#username').type(`user_${Date.now()}`)
            cy.get('#password').type('Test123!')
            cy.get('#confirmPassword').type('Test123!')

            cy.get('button[type="submit"]').click()

            cy.url().should('include', '/register')
            cy.contains(/istnieje|zajêty|already/i).should('be.visible')
        })
    })

})
