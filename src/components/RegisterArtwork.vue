<template>
<mdb-container>
  <mdb-row>
    <mdb-col sm="10" class="mx-auto">
    <h1>Artwork Registration</h1>
    <hr/>
    </mdb-col>
    <mdb-col sm="10" class="mx-auto">
              <mdb-card>
                <mdb-view hover>
                  <img class="img-fluid" width="100%" :src="artwork.image" :alt="artwork.title"/>
                  <mdb-mask flex-center waves overlay="white-slight"></mdb-mask>
                </mdb-view>
                <mdb-card-body>
                  <mdb-card-title>{{artwork.title}}</mdb-card-title>
                  <mdb-card-title class="text-right"><small>{{myArtist.name}}</small></mdb-card-title>
                  <hr/>
                  <mdb-card-text>Registering the artwork on the blockchain creates a Certificate of Authenticity (COA) that helps show the provenance of the
                  artwork and makes possible our unique ability to pay residuals to artists and galleries on secondary sales, <a href="#">read more..</a>
                  </mdb-card-text>
                </mdb-card-body>
                <mdb-card-body v-if="featureBitcoin">
                  <mdb-card-title>Bitcoin Blockchain <span v-if="bitcoinState">(Chain={{bitcoinState.chain}})</span></mdb-card-title>
                  <mdb-card-text>Register artwork on the Bitcoin blockchain here.</mdb-card-text>
                  <a class="black-text d-flex justify-content-end"><mdb-btn color="primary" size="sm" :disabled="registered" @click="registerArtworkBitcoin()">Register Bitcoin</mdb-btn></a>
                </mdb-card-body>
                <mdb-card-body v-if="featureEthereum">
                  <mdb-card-title>Ethereum Blockchain <span v-if="bitcoinState">(Network={{networkName}})</span></mdb-card-title>
                  <mdb-card-text>Register on ethereum if you use meta mask or another ethereum wallet.</mdb-card-text>
                  <a class="black-text d-flex justify-content-end"><mdb-btn v-if="featureEthereum" color="primary" size="sm" :disabled="registered" @click="registerArtworkEthereum()">Register Ethereum ({{networkName}})</mdb-btn></a>
                </mdb-card-body>
              </mdb-card>
    </mdb-col>
  </mdb-row>
</mdb-container>
</template>

<script>
import utils from "@/services/utils";
import notify from "@/services/notify";
import ethereumService from "@/services/ethereumService";
import bitcoinService from "@/services/bitcoinService";
// import OpenTimestamps from "javascript-opentimestamps";
import { mdbCol, mdbView, mdbMask, mdbRow, mdbContainer, mdbCard, mdbCardBody, mdbCardTitle, mdbCardText, mdbBtn } from "mdbvue";

// noinspection JSUnusedGlobalSymbols
export default {
  name: "RegisterArtwork",
  components: {
    mdbContainer,
    mdbCol,
    mdbMask,
    mdbView,
    mdbRow,
    mdbCard,
    mdbCardBody,
    mdbCardTitle,
    mdbCardText,
    mdbBtn
  },
  props: {
    artwork: {
      type: Object,
      default: function () { return {
          title: "Coming soon..",
          image: require("@/assets/img/city-profile.jpg")
        }
      }
    },
    fiatRates: [],
    networkName: {
      type: Object,
      default: function () { return {
          networkName: "?"
        }
      }
    },
    featureBitcoin: {
      type: Object,
      default: function () { return {
          featureBitcoin: true
        }
      }
    },
    featureEthereum: {
      type: Object,
      default: function () { return {
          featureEthereum: true
        }
      }
    },
    myArtist: {
      type: Object,
      default: function () { return {
          name: "Coming soon..",
          image: require("@/assets/img/city-profile.jpg")
        }
      }
    },
    registered: {
      type: Object,
      default: function () { return {
          registered: true
        }
      }
    },
    canRegister: {
      type: Object,
      default: function () { return {
          canRegister: true
        }
      }
    }
  },
  data() {
    return {
      message: null,
      artworkId: null,
      from: "/my-artworks"
    };
  },
  mounted() {
  },
  computed: {},
  methods: {
    closeModal: function() {
      this.$router.push(this.from);
    },
    registerArtworkBitcoin: function() {
      let artwork = this.$store.getters["myArtworksStore/myArtworkOrDefault"](
        this.artworkId
      );
      let regData = {
        title: artwork.title,
        timestamp: utils.buildArtworkHash(artwork.artwork[0].dataUrl),
        uploader: artwork.owner
      };
      bitcoinService.register(regData,
        function() {
        }, function() {
        });
      /**
      const file = Buffer.from(JSON.stringify(regData), "hex");
      const detached = OpenTimestamps.DetachedTimestampFile.fromBytes(
        new OpenTimestamps.Ops.OpSHA256(),
        file
      );
      OpenTimestamps.stamp(detached).then(() => {
        // const fileOts = detached.serializeToBytes()
        const infoResult = OpenTimestamps.info(detached);
        console.log(infoResult);
      });
      **/
    },
    registerArtworkEthereum: function() {
      this.message =
        "Registering your artwork - please allow a few minutes for the transaction to complete...";
      let artwork = this.$store.getters["myArtworksStore/myArtwork"](
        this.artworkId
      );
      if (!artwork || !artwork.id) {
        return;
      }
      let uploader = this.$store.getters["myAccountStore/getMyProfile"]
        .username;
      let regData = {
        title: artwork.title,
        timestamp: utils.buildArtworkHash(artwork.artwork[0].dataUrl),
        uploader: uploader
      };
      let $self = this;
      ethereumService.registerOnChain(
        regData,
        function(result) {
          notify.info({
            title: "Register Artwork.",
            text: "Transaction sent to the blockchain..."
          });
          artwork.bcitem = {
            registerTxId: result.txId,
            status: "pending-register"
          };
          $self.$store.commit("myArtworksStore/addMyArtwork", artwork);
          $self.$store
            .dispatch("myArtworksStore/updateArtwork", artwork)
            .then(artwork => {
              notify.info({
                title: "Register Artwork.",
                text: "User storage has been updated..."
              });
              $self.$store
                .dispatch("myArtworksStore/syncBlockchainState", artwork)
                .then(() => {});
              $self.closeModal();
            });
        },
        function() {
          $self.message =
            "Please check you are logged into your Meta Mask account and on the correct network.";
          notify.error({
            title: "Register Artwork.",
            text:
              "Error registering your item - please check meta mask is running and unlocked. <br>"
          });
        }
      );
    }
  }
};
</script>
