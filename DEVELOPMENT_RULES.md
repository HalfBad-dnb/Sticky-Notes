# Development Rules & Onboarding Guide

## 🚀 Project Onboarding

### Prerequisites
- Node.js 18+ and npm/yarn
- Java 17+ and Maven
- Git and GitHub account
- PostgreSQL (for local development)

### Setup Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/HalfBad-dnb/Sticky-Notes.git
   cd Sticky-Notes
   ```

2. **Backend setup**
   ```bash
   ./mvnw clean install
   ./run.sh
   ```

3. **Frontend setup**
   ```bash
   cd sticky-notes
   npm install
   npm run dev
   ```

4. **Electron development**
   ```bash
   npm run electron-dev
   ```

## 📋 Development Workflow Rules

### 🔥 Golden Rules (NEVER BREAK)

1. **NEVER work directly on `main` branch**
2. **NEVER push directly to `dev` branch**
3. **ALWAYS create feature branches from `dev`**
4. **ALWAYS write tests for new features**
5. **ALWAYS ensure all tests pass before PR**
6. **ALWAYS create a Pull Request for every change**
7. **NEVER merge to `dev` without permission**

### 🌿 Branch Management

#### Branch Naming Convention
- **Feature branches**: `feature/description-of-feature`
- **Bug fixes**: `fix/description-of-bug`
- **Hot fixes**: `hotfix/critical-fix-description`
- **Documentation**: `docs/update-documentation`

#### Branch Workflow

**For ALL changes (no exceptions):**
1. Create feature branch from `dev`
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. Work on your feature branch only

3. Keep branch updated with dev
   ```bash
   git checkout dev
   git pull origin dev
   git checkout feature/your-feature-name
   git rebase dev
   ```

4. Create PR targeting `dev` branch

5. Wait for approval before merging to `dev`

6. Only merge to `dev` with explicit permission

### 🧪 Testing Requirements

#### Backend Tests
- **Unit tests** for all new service methods
- **Integration tests** for API endpoints
- **Repository tests** for database operations
- **Security tests** for authentication/authorization

#### Frontend Tests
- **Component tests** for React components
- **Integration tests** for user flows
- **E2E tests** for critical user journeys

#### Electron Tests
- **Main process tests** for Electron functionality
- **Renderer process tests** for UI interactions

#### Test Coverage Requirements
- **Minimum 80% code coverage** for new code
- **No false positives** - all tests must be meaningful
- **All tests must pass** before PR submission

### 📝 Pull Request Process

#### PR Requirements (for significant changes only)
1. **Descriptive title** following conventional commits
2. **Detailed description** of changes made
3. **Test coverage report** (if applicable)
4. **Screenshots** for UI changes
5. **Breaking changes** clearly documented

#### PR Template
```markdown
## Description
Brief description of the change

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

#### Review Process
1. **Self-review** your own code first
2. **Request at least one reviewer**
3. **Address all review comments**
4. **Ensure CI/CD passes**
5. **Merge only after approval**

### 🚫 Forbidden Actions

#### NEVER DO:
- ❌ Work directly on `main` branch
- ❌ Push directly to `dev` branch
- ❌ Merge to `dev` without permission
- ❌ Commit sensitive data (API keys, passwords)
- ❌ Write tests without assertions
- ❌ Ignore failing tests
- ❌ Merge conflicts without resolution
- ❌ Commit large binary files
- ❌ Use `git push --force` to shared branches

#### ALWAYS DO:
- ✅ Create branches from `dev` only
- ✅ Write meaningful commit messages
- ✅ Test your changes thoroughly
- ✅ Update documentation
- ✅ Follow code style guidelines
- ✅ Handle errors gracefully
- ✅ Consider security implications
- ✅ Create PR for every change

### 🔄 Release Process

#### Version Management
1. **Semantic versioning**: `MAJOR.MINOR.PATCH`
2. **Update version numbers** in both backend and frontend
3. **Update CHANGELOG.md** with release notes
4. **Create GitHub release** with proper tagging

#### Deployment
1. **Backend**: Deploy Spring Boot JAR
2. **Frontend**: Build and deploy static files
3. **Electron**: Build and release new versions
4. **Database**: Run migrations if needed

### 📊 Code Quality Standards

#### Backend (Java/Spring)
- Follow **Spring Boot best practices**
- Use **proper exception handling**
- Implement **DTOs** for API responses
- Use **@Valid** for request validation
- Follow **RESTful API conventions**

#### Frontend (React)
- Use **functional components** with hooks
- Follow **React best practices**
- Implement **proper error boundaries**
- Use **TypeScript** when applicable
- Follow **accessibility guidelines**

#### General
- **Clean code principles**
- **DRY (Don't Repeat Yourself)**
- **SOLID principles**
- **Meaningful variable/function names**
- **Proper comments for complex logic**

### 🔍 Code Review Guidelines

#### What to Review:
- **Functionality**: Does it work as expected?
- **Code quality**: Is it clean and maintainable?
- **Performance**: Any performance concerns?
- **Security**: Any security vulnerabilities?
- **Tests**: Are tests adequate and meaningful?
- **Documentation**: Is documentation updated?

#### Review Etiquette:
- Be **constructive** and **respectful**
- Explain **why** changes are needed
- Suggest **improvements**, not just problems
- **Acknowledge good work** when appropriate

### 🛠️ Development Tools

#### Required Tools:
- **IDE**: IntelliJ IDEA or VS Code
- **Git**: Command line or GUI client
- **Database**: PostgreSQL with pgAdmin
- **API Testing**: Postman or Insomnia
- **Browser DevTools**: Chrome/Firefox

#### Recommended Extensions:
- **ESLint** for code linting
- **Prettier** for code formatting
- **SonarLint** for code quality
- **GitLens** for Git integration

### 📞 Getting Help

#### Resources:
- **Project documentation**: `DOCUMENTATION.md`
- **API documentation**: Available at `/api-docs`
- **Code examples**: Check existing implementations
- **Team communication**: Use project channels

#### When Stuck:
1. **Search existing code** for similar patterns
2. **Check documentation** and API specs
3. **Ask questions** in team channels
4. **Create draft PR** for early feedback

---

## 🎯 Success Metrics

### What Makes a Good Developer:
- **Consistent** with branch and PR workflow
- **Thorough** with testing and documentation
- **Collaborative** in code reviews
- **Proactive** in identifying issues
- **Responsible** for code quality

### What Makes Good Code:
- **Testable** and **tested**
- **Maintainable** and **readable**
- **Secure** and **performant**
- **Well-documented**
- **Follows conventions**

---

**Remember**: Quality over speed. It's better to take extra time to do it right than to rush and create technical debt.

🚀 **Happy Coding!**
