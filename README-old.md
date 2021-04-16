# Project of Data Visualization (COM-480)

| Student's name     | SCIPER |
| ------------------ | ------ |
| Marie Biolková     | 327156 |
| Marija Lazaroska   | 287052 |
| Ljupche Milosheski | 308507 |

[Milestone 1](#milestone-1-friday-23rd-april-5pm) • [Milestone 2](#milestone-2-friday-7th-may-5pm) • [Milestone 3](#milestone-3-friday-4th-june-5pm)

## Milestone 1 (Friday 23rd April, 5pm)

**10% of the final grade**

### Dataset

*Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.*

- All Grand Slam winners and runner-ups (male and female)
- Scrape profiles from Wikipedia
- Statistics on the final match
- [Grand Slam prize money](https://github.com/popovichN/grand-slam-prize-money/blob/master/tennis_pay.csv) ?

### Problematic

*Frame the general topic of your visualization and the main axis that you want to develop. What am I trying to show with my visualization? Think of an overview for the project, your motivation, and the target audience.*

Tennis is one of the most popular individual sports world-wide. Professional tennis events receive a lot of attention, in particular the four major tournaments known as the Grand Slam. In this project, we aim to create an interactive visualization of data from the Grand Slam finals in the [Open Era](https://en.wikipedia.org/wiki/History_of_tennis#Open_Era) (1968-). This will allow the users to travel back in time and explore the careers of the best players in tennis history and their rivalries. The tool should satisfy anyone from the general public: from sports newbies to tennis-savvy users.

The visualization will capture two different points of view:
1. The first one will focus on the success of the finalists in terms of the number of wins and runner-ups over a specified period of time. This will allow to compare the performance of players who were active during the same time period, as well as accross generations.
2. Secondly, by creating a network of players who competed against each other in a Grand Slam final, we will identify some of the greatest rivals as well as one-hit wonders.

User profiles and match statistics will provide additional context. *FINISH*

### Exploratory Data Analysis

*Pre-processing of the data set you chose. Show some basic statistics and get insights about the data*

- Group by decade, show for each tournament the finalists.
- Match statistics: need to scrape more data for this.
- Parse the player information so that it is clean (e.g. deal with multiple countries etc.)

  

### Related work

*What others have already done with the data? Why is your approach original? What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).*


* [DB4Tennis](https://www.db4tennis.com/) and [Ultimate Tennis Statistics](https://www.ultimatetennisstatistics.com/)
These 2 websites provide records of the Grand Slam tournaments over the years(statistics about number of appearances of players, number of matches, most Grand Slam titles etc.). They also provide an option to filter the data. However, the data is visualized using static tables and we would like to create more interactive visualizations.

* [Grand Slam Stats](https://jpvsilva88.github.io/tennis/)
This is a website that provides an interactive timeline plot showing the number of participants from up to 5 countries through the years for the 4 Grand Slam Tournaments. We would like to take this plot as an inspiration for separating the data according to the timeline. However we would like to add some more statistics depending on the time period and give the user the option to choose the statistics it wants to be displayed.

* [Men's Tennis: Grand Slam Finalists by Phil Simon](https://www.philsimon.com/blog/data/visualizing-mens-grand-slam-winners/)
This website provides an interactive visualization of Grand Slam Finalists focused only on male players. The data is presented only using tables, but we would like to use graphs. In addition we would also consider data concerning female players. 


* [Visualizing Tennis Grand Slam Winners Performances](https://datascienceplus.com/visualizing-tennis-grand-slam-winners-performances/)
This article provides different techniques to visualize data from the dataset similiar to the one we intend to use. The data is visualized using a chord diagram, a radar plot, a bar plot but there is no example of using graphs which is what we intend to do.

Some examples we were inspired by but are not realted to our topic:

* [An analysis of the Beatles by Adam E. McCann](https://www.tableau.com/community/music/beatles#video)
This is a visualization of the Beatles data according to the band members. The structure of the graph is very interesting and it gives the user a clear view of which member wrote which song in which year. It also allows the user to select for which band member to see the data.

## Milestone 2 (Friday 7th May, 5pm)

**10% of the final grade**

## Milestone 3 (Friday 4th June, 5pm)

**80% of the final grade**

