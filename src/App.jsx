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
  Divider
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import Fuse from "fuse.js";

const MemoisedCard = React.memo(function CardComponent({ card, chipColour, index }) {
  return (
    <Grid size={{ xs: 12, md: 4 }} key={index}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 2, justifyContent: "space-between" }}
            useFlexGap
          >
            <Typography variant="h5" component="div">
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
          <Divider component="div" />
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {card.description}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
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
          </AppBar>
          <Grid container spacing={2} sx={{ mt: 5 }}>
            {searchResults.map((card, index) => (
              <MemoisedCard key={index} card={card} chipColour={chipColour} index={index} />
            ))}
          </Grid>
        </Box>
      )}
    </>
  );
}

export default App