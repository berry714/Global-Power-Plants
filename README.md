Title: Exploring The World's Power Plants


 Lab 2: Interactive Mapping


 ![alt text](https://raw.githubusercontent.com/berry714/Global-Power-Plants/main/screenshot.png "Exploring The World's Power Plants")


 Link to map: https://berry714.github.io/Global-Power-Plants/


Collaborations and reliance on other resources:

What did you learn from a peer map critique, if you did one?

I didn't conduct a peer map critique with anyone from the class but did ask around and user test my map with numerous other people. Initial user testing was conducted very early on in the map creation process, before I had styled my data. Therefore, much of the feedback centered around stylistic choices (which I asssumed would occur). More helpful suggestions came from the insight and purpose of my map, which led to a sequence of decisions that ultimately resulted in my final map. These suggestions led directly to the creation of the capacity slider as well as the checkboxes for each fuel type. They helped in deciding to not implement a dropdown menu (which was originially implemented) and instead use checkboxes for ease of control and accessibility. Also, the inclusion of greenhouse gas emissions as a layer that could be toggled provides further insight into power plants without taking the focus away from them.

What coding resources (and individuals) did you draw upon in the process of making your map, and to what effect?

I relied heavily on tutorials and examples of varying degrees provided by Mapbox on Mapbox GL JS. In addition to this, issues were troubleshooted with frequent visits to stack overflow and GIS stack exchange in addition to a whole lot of trial and error.


Reflective Analysis:

The interactive map "Exploring The World's Power Plants" aims to visualize the global distribution of power plants, emphasizing capacity, and fuel type, and including some supplementary information per country. Targeted towards environmental researchers, policymakers, educators, and the general public interested in the global energy landscape. This map attempts to foster a comprehensive understanding of the distribution of energy generation facilities and the diversity of fuel types around the world, in the process, aiming to address questions related to the geographical and operational diversity of power plants worldwide, facilitating comparative analysis of energy profiles among different countries.


The development of this map followed a structured design process, incorporating iterative phases of design and user feedback, aligned with the principles outlined by Roth (2017) in his article on UI/UX Design within GIS. Initial stages focused on data collection and preparation, and the styling of the power plants layer. Then the integration of interactive elements — such as filters for fuel types and sliders for plant capacity—to enable dynamic user exploration of the dataset. Next (inspired by user feedback) incorporating GHG emissions data as a supplementary layer aimed to enrich the analysis by providing context on environmental impacts. The choice of data and the cartographic stylings were intellectually justified by the aim to present complex datasets in an accessible manner, fostering insights into global energy production dynamics. Colours of point symbols, sorted by fuel type and sized based on capacity (MW), provide a simplified and more accessible way to view the data. I included affordances (Roth, 2017) throughout my map, such as a hover effect changing the cursor style to indicate a point as clickable or as having an associated popup, underlining to indicate an external link, and changing styles of buttons to indicate it as clickable. Along with affordances, feedback was incorporated to signal to the user that an action has occurred as a result of their interaction (Roth, 2017), such as changing the color of the "Countries" or "Filters" button to indicate a layer as active.

Interactivity:
1. Hover effect over all points (change cursor style and show a popup of some limited information)
2. Sidebar popup for power plants station including more detailed information only if it is available for that power plant.
3. A 'Filters' button that toggles the filters panel displaying fuel types and associated symbolization colours as well as a checkbox for each one. This filters panel also includes the option of displaying primary fuel sources and/ or secondary fuel sources, to allow the user freedom in exploring the dataset.
4. A 'Countries' button that toggles on and off a layer of country centroids that are symbolized to reflect their corresponding greenhouse gas emissions, along its legend.
5. A capacity slider that allows the user to control the minimum capacity threshold in MW for power plant stations to be displayed.


There are, however, several constraints and potential improvements that could be made to the map. While successful in offering a broad overview, the representation could be improved through higher-resolution data, enabling more detailed regional analyses. Future iterations could benefit from incorporating further user feedback to refine interactivity and data representation, ensuring the map evolves to meet user needs more effectively. Also, presenting the country-level data as polygons that outline each country's boundaries would better convey the meaning of the associated data. By displaying this layer as polygon feature classes, the symbolization would not clash with the power plant locations, allowing the user to make inferences and analyze the two datasets more seamlessly. The iterative design process underscores the importance of continuous improvement and adaptation in developing effective cartographic representations (Roth, 2017).



References

Roth, R. E. (2017). User Interface and User Experience (UI/UX) Design. The Geographic Information Science & Technology Body of Knowledge (2nd Quarter 2017 Edition), John P. Wilson (ed.). DOI: 10.22224/gistbok/2017.2.5Links to an external site..
