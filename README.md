# Movie Recommender

A modern, responsive movie discovery and recommendation web application built with Angular 20 and powered by The Movie Database (TMDB) API. Discover popular movies, search for specific titles, and manage your personal favorites list.

## 🎬 Features

### Movie Discovery
- **Browse Popular Movies**: Explore trending and popular movies
- **Category Browsing**: View movies by categories:
  - Now Playing
  - Top Rated
  - Upcoming
  - Popular
- **Advanced Search**: Search for movies by title with real-time results
- **Detailed Movie Information**: View comprehensive movie details including:
  - Plot overview, cast, and crew
  - Release date, runtime, and ratings
  - Production companies and countries
  - High-quality posters and backdrops

### Features
- **Favorites Management**: Add/remove movies to your personal favorites list
- **User Authentication**: Sign in with Firebase Authentication
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Pagination**: Navigate through large movie collections efficiently
- **State Management**: Centralized state management with custom services
- **Caching**: Intelligent API response caching for improved performance
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Smooth loading indicators and skeleton screens
- **Material Design**: Modern UI with Angular Material components

## 🚀 Technologies Used

- **Frontend**: Angular 20 with TypeScript
- **UI Framework**: Angular Material
- **State Management**: Custom state management services with RxJS
- **Authentication**: Firebase Authentication
- **API**: The Movie Database (TMDB) API
- **Styling**: SCSS with Material Design
- **Testing**: Jasmine and Karma
- **Build Tool**: Angular CLI
- **Deployment**: Vercel (configured)

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- npm or yarn package manager
- TMDB API key (free registration at [themoviedb.org](https://www.themoviedb.org/settings/api))
- Firebase project (for authentication)

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/imalisusan/movie-recommender
   cd movie-recommender
   ```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
