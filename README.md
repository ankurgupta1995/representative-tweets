# representative-tweets
Project for Juji, Inc

Design choices:

I used Express and Node for the backend, and used ejs and bootstrap for the frontend. NodeJS and ExpressJS are new technologies that I have recently picked up, and I wanted to attempt a project that would require me to use libraries that I have not used before. I have used PassportJS's Twitter Strategy for authentication and used the authenticated user's access token or my own if nobody has logged in, for the Twitter Search API. I also utilized the async library to avoid multiple nested callbacks.

The tweets being represented are combination of the user's most recent popular tweets (depending on the favorites and statuses by other users) and the user's most recent favorited tweets. I believe these are a close to accurate representation of the user's current personality/mood/views.