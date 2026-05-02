1. Create package.json
    npm init -y

2. Create .env file
        npm i dotenv

3. Create express app & assign port number
        npm i express

4. Connect to db
        npm i mongoose

5. define schemas and create Modules
    - UserTypeSchema
        firstName
        lastName
        email(unique)
        password
        role
        profileImageUrl
        isUserActice

    - ArticleSchema
        author
        title
        category
        content
        comments
        isArticleActive

6. Implement API's

7. Create common api for register, login, and logout

8. npm i cookie-parser