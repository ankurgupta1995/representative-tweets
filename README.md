# representative-tweets
Project for Juji, Inc

Design choices:

I used Express and Node for the backend, and used ejs and bootstrap for the frontend. NodeJS and ExpressJS are new technologies that I have recently picked up, and I wanted to attempt a project that would require me to use libraries that I have not used before. I have used PassportJS's Twitter Strategy for authentication and used the authenticated user's access token or my own if nobody has logged in, for the Twitter Search API.

At this point in time, my representative tweets are just the tweets that the searched user has most recently favorited. I think these should be a part of the representative tweets for the searched user because it gives an insight into what the person currently likes/supports. I plan on using a combination of that, the searched user's most recent retweets and his/her most popular tweets.