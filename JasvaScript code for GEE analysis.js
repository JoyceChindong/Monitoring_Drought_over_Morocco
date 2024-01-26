//**Step I: Data collection**
var Modis = ee.ImageCollection("MODIS/061/MOD13Q1"),
    Morocco = ee.FeatureCollection("projects/ee-joycechindong/assets/Maroc");
    
// Select the NDVI band and place it in a variable
var NDVI_band = Modis.select('NDVI');

// Define the years
var years = [ 2004,2005,2006,2007,2008,2009,2010, 2011, 2012, 2013, 2014, 2019];

// Clip the filtered image to ROI and export for each year
years.forEach(function(year) {
  // Filter image to show results for the given year
  var filteredImage = NDVI_band.filterDate(year + '-04-01', year + '-04-14');
  
  // Clip the filtered image to ROI
  var clippedImage = filteredImage.map(function(image) {
    return image.clip(Morocco);
  });

  // Create a single image from the ImageCollection
  var mosaicImage = clippedImage.mosaic();

var ndviVis = {
  min: 0,
  max: 8000,
  palette: [
    'ffffff', 'ce7e45', 'df923d', 'f1b555', 'fcd163', '99b718', '74a901',
    '66a000', '529400', '3e8601', '207401', '056201', '004c00', '023b01',
    '012e01', '011d01', '011301'
  ],
};

  // Display the clipped image
  Map.addLayer(mosaicImage, ndviVis, 'Merged NDVI ' + year);

  // Export the single image to Asset
  Export.image.toAsset({
    image: mosaicImage,
    description: 'Merged_NDVI_' + year,
    assetId: 'Merged_NDVI_' + year,
    scale: 250,
    maxPixels: 20000000000,
  });
});

//**Step II: Calculating Anomaly**
var image1 = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2004"),
    image2 = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2005"),
    image3 = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2006"),
    image4 = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2007"),
    image5 = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2008"),
    image6 = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2009"),
    image7 = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2010"),
    image8 = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2011"),
    image9 = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2012"),
    image10 = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2013"),
    image11 = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2014"),
    Final = ee.Image("projects/ee-joycechindong/assets/NDVI_images/NDVI_2019");

// Create a list of images
var imageList = [image1, image2, image3, image4, image5, image6, image7, image8, image9,image10, image11];

// Function to scale MODIS NDVI to the range of -1 to 1
var scaleNDVI = function(image) {
  return image.expression('NDVI * 0.0001', {'NDVI': image}).rename('NDVI_scaled');
};

// Map the scaling function over the MODIS NDVI image list
var scaledMODISNDVIList = imageList.map(scaleNDVI);


// Reduce the list of scaled MODIS NDVI images to calculate the mean
var imageMean = ee.ImageCollection(scaledMODISNDVIList).mean();

// Scale the 2019 NDVI image
var scaledNDVI2019 = scaleNDVI(Final);

// Calculate NDVI anomaly by subtracting the mean from the scaled 2019 NDVI image
var Anomaly = scaledNDVI2019.subtract(imageMean);

// Display the results on the map
Map.addLayer(imageMean,{min: -1, max: 1, palette: ['red', 'white', 'blue']}, 'Image Mean');
Map.addLayer(Anomaly, {min: -1, max: 1, palette: ['red', 'white', 'blue']}, 'NDVI Anomaly');

// Print the resulting images
print('Image Mean:', imageMean);
print('NDVI Anomaly:', Anomaly);

// Export the results to google Drive
Export.image.toDrive({
  image: imageMean,
  description: 'image_mean',
  scale: 250,  
  maxPixels: 20000000000,
});

Export.image.toDrive({
  image: Anomaly,
  description: 'ndvi_anomaly',
  scale: 250, 
  maxPixels: 20000000000,
});
