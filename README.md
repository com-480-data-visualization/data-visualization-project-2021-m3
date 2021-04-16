# Project of Data Visualization (COM-480)

| Student's name     | SCIPER |
| ------------------ | ------ |
| Marie Biolková     | 327156 |
| Marija Lazaroska   | 287052 |
| Ljupche Milosheski | 308507 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (23rd April, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

> Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.
>
> Hint: some good pointers for finding quality publicly available datasets ([Google dataset search](https://datasetsearch.research.google.com/), [Kaggle](https://www.kaggle.com/datasets), [OpenSwissData](https://opendata.swiss/en/), [SNAP](https://snap.stanford.edu/data/) and [FiveThirtyEight](https://data.fivethirtyeight.com/)), you could use also the DataSets proposed by the ENAC (see the Announcements section on Zulip).

- All Grand Slam winners and runner-ups (male and female)
- Scrape profiles from Wikipedia
- Statistics on the final match
- [Grand Slam prize money](https://github.com/popovichN/grand-slam-prize-money/blob/master/tennis_pay.csv) ?

### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience.

Tennis is one of the most popular individual sports world-wide. Professional tennis events receive a lot of attention, in particular the four major tournaments known as the Grand Slam. In this project, we aim to create an interactive visualization of data from the Grand Slam finals in the [Open Era](https://en.wikipedia.org/wiki/History_of_tennis#Open_Era) (1968-). This will allow the users to travel back in time and explore the careers of the best players in tennis history and their rivalries. The tool should satisfy anyone from the general public: from sports newbies to tennis-savvy users.

The visualization will capture two different points of view:
1. The first one will focus on the success of the finalists in terms of the number of wins and runner-ups over a specified period of time. This will allow to compare the performance of players who were active during the same time period, as well as accross generations.
2. Secondly, by creating a network of players who competed against each other in a Grand Slam final, we will identify some of the greatest rivals as well as one-hit wonders.

User profiles and match statistics will provide additional context. *FINISH*

### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data


### Related work


> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

* [DB4Tennis](https://www.db4tennis.com/) and [Ultimate Tennis Statistics (UTS)](https://www.ultimatetennisstatistics.com/) provide detailed records of tennis tournaments over the years. Although they give an option to filter, there is a lot of information and the data is shown using static tables. We would like to create more interactive visualizations and focus specifically on Grand Slam finals. Furthermore, DB4Tennis requires subscription to view the contents.

* [Grand Slam Stats](https://jpvsilva88.github.io/tennis/) offers an interactive timeline plot showing the number of participants from up to 5 countries through the years for the 4 Grand Slam Tournaments. While we think it is a good idea to introduce a timeline for the data, we would like to show different statistics and allow filtering depending on time. This will allow the user to choose the time period (and range) to be displayed.

* [Men's Tennis: Grand Slam Finalists by Phil Simon](https://www.philsimon.com/blog/data/visualizing-mens-grand-slam-winners/) provides an interactive visualization of Grand Slam finalists focused only on male players. The data is presented only using tables, but we would like to use graphs. In addition we would also consider data concerning female players. 

* [Visualizing Tennis Grand Slam Winners Performances](https://datascienceplus.com/visualizing-tennis-grand-slam-winners-performances/) – This article demonstrates different techniques to visualize data in R using a dataset similiar to the one we intend to use. Some of the visualizations include a chord diagram, a radar plot, a bar plot etc. We will explore different visualization types, including a network graph.

Some examples we were inspired by but are not related to our topic:

* [An analysis of the Beatles by Adam E. McCann](https://www.tableau.com/community/music/beatles#video) is a Sankey diagram that associates The Beatles' songs with the band members that wrote the lyrics. The structure of the graph is very interesting and it gives the user a clear view of which member wrote which song in which year. It also allows the user to select for which band member to see the data, so it would be interesting to apply this in the context of the Grand Slam data.

## Milestone 2 (7th May, 5pm)

**10% of the final grade**


## Milestone 3 (4th June, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

