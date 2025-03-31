import React, { useState, useEffect } from "react"
import {
  AppBar,
  Box,
  Grid,
  Card,
  Chip,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  Stack,
  Divider,
  List,
  ListItem,
  Button,
  ButtonGroup
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import Fuse from "fuse.js";

const MemoisedCard = React.memo(function CardComponent({ card, chipColour, index }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack
          direction="row"
          spacing={0}
          sx={{ justifyContent: "space-between" }}
          useFlexGap
        >
          <Typography variant="h5" component="h3">
            {card.item}
          </Typography>
          {card.bins.map((bin, index) => (
            <Chip
              key={index}
              size="sm"
              icon={<DeleteIcon />}
              variant="outlined"
              color={chipColour(bin.Value)}
              label={bin.Value}
            />
          ))}
        </Stack>
        {card.categories.map((category, index) => (
          <Typography variant="body1" color="text.secondary" key={index}>
            {category.Value}
          </Typography>
        ))}
        <Divider component="div" sx={{ mt: 2 }} />
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {card.description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
});

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://prod-08.westeurope.logic.azure.com/workflows/ca70293f1f794cbbb7a01b83afb5ce35/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=t_1WSC4ALUlj86fVS5lBvbarJ3n3t9tabLWgL0H8Mng");
        const data = await response.json();
        data.sort((a, b) => a.item.localeCompare(b.item));
        setCards(data);
        setSearchResults(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fuse = new Fuse(cards, {
    includeScore: true,
    includeMatches: true,
    threshold: 0.2,
    keys: ["item"],
  })

  const handleSearch = (event) => {
    const { value } = event.target;

    if (value.length === 0) {
      setSearchResults(cards);
      return;
    }

    const results = fuse.search(value);
    const items = results.map((result) => result.item);
    setSearchResults(items);

  };

  const groupAndSort = (items) => {
    const grouped = {};
    items.forEach(item => {
      const firstLetter = item.item.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(item);
    });
    return grouped;
  };

  const chipColour = (colour) => {
    switch (colour.toLowerCase()) {
      case "blue bin":
        return "primary"
      case "brown bin":
        return "warning"
      case "greencaddy":
        return "success"
      default:
        return "default"
    };
  }

  const groupedResults = groupAndSort(searchResults);

  return (
    <>
      {loading ? (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ height: "300px" }} >
          <CircularProgress />
        </Stack>
      ) : (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="sticky" color="inherit" sx={{ px: 5 }} elevation={0}>
            <TextField
              label="Filter items..."
              variant="outlined"
              fullWidth
              margin="normal"
              onChange={handleSearch}

            />
            <ButtonGroup variant="outlined" aria-label="A-Z list of items" fullWidth sx={{overflowX: "auto"}}>
              {Object.keys(groupedResults).sort().map((letter) => (
                <Button
                key={letter}
                variant="outlined"
                color="primary"
                size="large"
                href={`#${letter}`}
              >
                {letter}
              </Button>
              ))}
            </ButtonGroup>
          </AppBar>
          <List sx={{ width: '100%', bgcolor: 'background.paper', mt: 5 }}>
            {Object.keys(groupedResults).sort().map(letter => (
              <ListItem key={letter} sx={{ width: "100%" }}>
                <Grid container key={letter} sx={{ width: "100%" }}>
                  <Grid item size={{xs: 12}}>
                    <Typography 
                      variant="h4" 
                      component="h2"
                      color="text.secondary" 
                      sx={{my: 2, marginTop: "-200px", paddingTop: "200px"}} 
                      id={letter}>
                        {letter}
                    </Typography>
                  </Grid>
                  <Grid container item size={{xs: 12}}  spacing={2}>
                    {groupedResults[letter].map((card, index) => (
                      <Grid item size={{xs: 12, md: 6, lg: 4}} key={index}>
                        <MemoisedCard card={card} chipColour={chipColour} index={index} />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </>
  );
}

export default App